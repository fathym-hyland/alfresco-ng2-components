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
import { AlfrescoApiService, UserPreferencesService } from '@alfresco/adf-core';
import {
    CategoriesApi,
    CategoryBody,
    CategoryEntry,
    CategoryPaging,
    RequestQuery,
    ResultSetPaging,
    SearchApi
} from '@alfresco/js-api';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private _categoriesApi: CategoriesApi;
    private _searchApi: SearchApi;

    get categoriesApi(): CategoriesApi {
        this._categoriesApi = this._categoriesApi ?? new CategoriesApi(this.apiService.getInstance());
        return this._categoriesApi;
    }

    get searchApi(): SearchApi {
        this._searchApi = this._searchApi ?? new SearchApi(this.apiService.getInstance());
        return this._searchApi;
    }

    constructor(private apiService: AlfrescoApiService, private userPreferencesService: UserPreferencesService) {}

    /**
     * Get subcategories of a given parent category
     *
     * @param parentCategoryId The identifier of a parent category.
     * @param skipCount Number of top categories to skip.
     * @param maxItems Maximum number of subcategories returned from Observable.
     * @return Observable<CategoryPaging>
     */
    getSubcategories(parentCategoryId: string, skipCount?: number, maxItems?: number): Observable<CategoryPaging> {
        return from(this.categoriesApi.getSubcategories(parentCategoryId ?? '-root-', {skipCount, maxItems}));
    }

    /**
     * Creates subcategory under category with provided categoryId
     *
     * @param parentCategoryId The identifier of a parent category.
     * @param payload Created category body
     * @return Observable<CategoryEntry>
     */
    createSubcategory(parentCategoryId: string, payload: CategoryBody): Observable<CategoryEntry> {
        return from(this.categoriesApi.createSubcategory(parentCategoryId, [payload], {}));
    }

    /**
     * Updates category
     *
     * @param categoryId The identifier of a category.
     * @param payload Updated category body
     * @return Observable<CategoryEntry>
     */
    updateCategory(categoryId: string, payload: CategoryBody): Observable<CategoryEntry> {
        return from(this.categoriesApi.updateCategory(categoryId, payload, {}));
    }

    /**
     * Deletes category
     *
     * @param categoryId The identifier of a category.
     * @return Observable<void>
     */
    deleteCategory(categoryId: string): Observable<void> {
        return from(this.categoriesApi.deleteCategory(categoryId));
    }

    /**
     * Searches categories by their name.
     *
     * @param name Value for name which should be used during searching categories.
     * @param skipCount Specify how many first results should be skipped. Default 0.
     * @param maxItems Specify max number of returned categories. Default is specified by UserPreferencesService.
     * @return Observable<ResultSetPaging> Found categories which name contains searched name.
     */
    searchCategories(name: string, skipCount = 0, maxItems?: number): Observable<ResultSetPaging> {
        maxItems = maxItems || this.userPreferencesService.paginationSize;
        return from(this.searchApi.search({
            query: {
                language: RequestQuery.LanguageEnum.Afts,
                query: `cm:name:"*${name}*" AND TYPE:'cm:category' AND PATH:"/cm:categoryRoot/cm:generalclassifiable//*"`
            },
            paging: {
                skipCount,
                maxItems
            },
            include: ['path']
        }));
    }
}
