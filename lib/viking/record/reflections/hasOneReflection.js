import { Reflection } from '../reflection';
import { Name } from '../name';

export const HasOneReflection = Reflection.extend({

    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasOne';
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
