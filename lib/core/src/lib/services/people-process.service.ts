/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { UserProcessModel } from '../models/user-process.model';
import { AlfrescoApiService } from './alfresco-api.service';
import { LogService } from '../common/services/log.service';
import { catchError, combineAll, defaultIfEmpty, map, switchMap } from 'rxjs/operators';
import {
    TaskActionsApi,
    UsersApi,
    ResultListDataRepresentationLightUserRepresentation, ActivitiGroupsApi
} from '@alfresco/js-api';
import { GroupModel } from '../form';

@Injectable({
    providedIn: 'root'
})
export class PeopleProcessService {

    private _taskActionsApi: TaskActionsApi;
    get taskActionsApi(): TaskActionsApi {
        this._taskActionsApi = this._taskActionsApi ?? new TaskActionsApi(this.apiService.getInstance());
        return this._taskActionsApi;
    }

    private _userApi: UsersApi;
    get userApi(): UsersApi {
        this._userApi = this._userApi ?? new UsersApi(this.apiService.getInstance());
        return this._userApi;
    }

    private _groupsApi: ActivitiGroupsApi;
    get groupsApi(): ActivitiGroupsApi {
        this._groupsApi = this._groupsApi ?? new ActivitiGroupsApi(this.apiService.getInstance());
        return this._groupsApi;
    }

    constructor(private apiService: AlfrescoApiService,
                private logService: LogService) {
    }

    /**
     * Gets a list of groups in a workflow.
     *
     * @param filter Filter to select specific groups
     * @param groupId Group ID for the search
     * @returns Array of groups
     */
    getWorkflowGroups(filter: string, groupId?: string): Observable<GroupModel[]> {
        const option: any = { filter };
        if (groupId) {
            option.groupId = groupId;
        }
        return from(this.groupsApi.getGroups(option))
            .pipe(
                map((response: any) => response.data || []),
                catchError((err) => this.handleError(err))
            );
    }

    /**
     * Gets information about users across all tasks.
     *
     * @param taskId ID of the task
     * @param searchWord Filter text to search for
     * @returns Array of user information objects
     */
    getWorkflowUsers(taskId?: string, searchWord?: string, groupId?: string): Observable<UserProcessModel[]> {
        const option = { excludeTaskId: taskId, filter: searchWord, groupId };

        return from(this.getWorkflowUserApi(option))
            .pipe(
                switchMap(response => response.data as UserProcessModel[] || []),
                map((user) => {
                    user.userImage = this.getUserProfileImageApi(user.id.toString());
                    return of(user);
                }),
                combineAll(),
                defaultIfEmpty([]),
                catchError((err) => this.handleError(err))
            );
    }
    /**
     * Gets the profile picture URL for the specified user.
     *
     * @param user The target user
     * @returns Profile picture URL
     */
    getUserImage(user: UserProcessModel): string {
        return this.getUserProfileImageApi(user.id.toString());
    }

    /**
     * Sets a user to be involved with a task.
     *
     * @param taskId ID of the target task
     * @param idToInvolve ID of the user to involve
     * @returns Empty response when the update completes
     */
    involveUserWithTask(taskId: string, idToInvolve: string): Observable<UserProcessModel[]> {
        const node = { userId: idToInvolve };
        return from(this.involveUserToTaskApi(taskId, node))
            .pipe(
                catchError((err) => this.handleError(err))
            );
    }

    /**
     * Removes a user who is currently involved with a task.
     *
     * @param taskId ID of the target task
     * @param idToRemove ID of the user to remove
     * @returns Empty response when the update completes
     */
    removeInvolvedUser(taskId: string, idToRemove: string): Observable<UserProcessModel[]> {
        const node = { userId: idToRemove };
        return from(this.removeInvolvedUserFromTaskApi(taskId, node))
            .pipe(
                catchError((err) => this.handleError(err))
            );
    }

    private getWorkflowUserApi(options: any): Promise<ResultListDataRepresentationLightUserRepresentation> {
        return this.userApi.getUsers(options);
    }

    private involveUserToTaskApi(taskId: string, node: any) {
        return this.taskActionsApi.involveUser(taskId, node);
    }

    private removeInvolvedUserFromTaskApi(taskId: string, node: any) {
        return this.taskActionsApi.removeInvolvedUser(taskId, node);
    }

    private getUserProfileImageApi(userId: string): string {
        return this.userApi.getUserProfilePictureUrl(userId);
    }

    private handleError(error: any) {
        this.logService.error(error);
        return throwError(error || 'Server error');
    }
}
