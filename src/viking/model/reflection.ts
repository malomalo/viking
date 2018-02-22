import * as _ from 'underscore';
import * as Backbone from 'backbone';

import { constantize } from '../support/string';
import { Name } from './name';

export class Reflection {

    static extend = Backbone.Model.extend;

    macro: string;

    modelName: Name;

    collectionName: string;

    constructor() {
        this.macro = '';
        this.modelName = new Name('');
        this.collectionName = '';
    }

    klass() {
        if (this.macro === 'hasMany') {
            return this.collection();
        }

        return this.model();
    }

    model() {
        return this.modelName.model();
    }

    collection(): any {
        return constantize(this.collectionName);
    }

}
