import * as _ from 'underscore';
import * as Backbone from 'backbone';

import { constantize } from '../support/string';
import { Name } from './name';

export class Reflection {

    macro: string;

    modelName: Name;

    collectionName: string;

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

    static extend = Backbone.Model.extend;

}
