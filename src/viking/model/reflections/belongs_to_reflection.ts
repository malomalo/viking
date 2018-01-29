import * as _ from 'underscore';

import { Reflection } from '../reflection';
import { Name } from '../name';

export const BelongsToReflection = Reflection.extend({

    constructor: function (name, options) {
        this.name = name;
        this.macro = 'belongsTo';
        this.options = _.extend({}, options);

        if (!this.options.polymorphic) {
            if (this.options.modelName) {
                this.modelName = new Name(this.options.modelName);
            } else {
                this.modelName = new Name(name);
            }
        }
    }

});
