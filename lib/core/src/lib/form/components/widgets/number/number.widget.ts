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

 /* eslint-disable @angular-eslint/component-selector, @angular-eslint/no-input-rename */

import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormService } from '../../../services/form.service';
import { WidgetComponent } from '../widget.component';
import { DecimalNumberPipe } from '../../../../pipes/decimal-number.pipe';

@Component({
    selector: 'number-widget',
    templateUrl: './number.widget.html',
    styleUrls: ['./number.widget.scss'],
    host: {
        '(click)': 'event($event)',
        '(blur)': 'event($event)',
        '(change)': 'event($event)',
        '(focus)': 'event($event)',
        '(focusin)': 'event($event)',
        '(focusout)': 'event($event)',
        '(input)': 'event($event)',
        '(invalid)': 'event($event)',
        '(select)': 'event($event)'
    },
    encapsulation: ViewEncapsulation.None
})
export class NumberWidgetComponent extends WidgetComponent implements OnInit {

    displayValue: number;

    constructor(public formService: FormService,
                private decimalNumberPipe: DecimalNumberPipe) {
         super(formService);
    }

    ngOnInit() {
        if (this.field.readOnly) {
            this.displayValue = this.decimalNumberPipe.transform(this.field.value);
        } else {
            this.displayValue = this.field.value;
        }
    }

}
