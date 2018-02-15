import * as _ from 'underscore';

import { singularize } from '../../support/string';
import { Name } from '../name';
import { Reflection } from '../reflection';

export const HasManyReflection = Reflection.extend({

    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasMany';
        this.options = _.extend({}, options);

        if (this.options.modelName) {
            this.modelName = new Name(this.options.modelName);
        } else {
            this.modelName = new Name(singularize(this.name));
        }

        if (this.options.collectionName) {
            this.collectionName = this.options.collectionName;
        } else {
            this.collectionName = this.modelName.collectionName;
        }
    }

});
