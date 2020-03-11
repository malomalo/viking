import Model from 'viking/record';
import Reflection from 'viking/record/reflection';
import BelongsToAssociation from 'viking/record/associations/belongsToAssociation';

// export interface IBelongsToReflectionOptions {
//     foreignKey?: string;
//     foreignType?: string;
//     polymorphic?: typeof Model[];
// }

export default class BelongsToReflection extends Reflection {

    name;//: string;
    model;//: typeof Model;
    options;//: IBelongsToReflectionOptions;

    // constructor(model: typeof Model, options?: IBelongsToReflectionOptions);
    // constructor(name: string, model: Model, options?: IBelongsToReflectionOptions);
    // constructor(name: string, options: IBelongsToReflectionOptions);
    constructor(name, model, options) {
        super();
        
        if (Model.isPrototypeOf(name)) {
            options = model;
            model = name;
            name = model.modelName().singular;
        } else if (!Model.isPrototypeOf(model)) {
            options = model;
            model = undefined;
        }


        this.name = name;
        this.macro = 'belongsTo';
        this.model = model || (options ? options.model : undefined);
        this.options = options || {};
    }

    // attachTo(model: Model)
    attachTo(model) {
        let association = new BelongsToAssociation(model, this);

        Object.defineProperty(model, this.name, {
            get: () => {
                return association.load();
            },
            set: (target) => {
                association.setTarget(target);
            }
        });

        return association;
    }

    foreignKey() {
        if (this.options.foreignKey) {
            return this.options.foreignKey;
        } else {
            return this.model.modelName().paramKey + '_id';
        }
    }
}

// export function belongsTo(model: typeof Model, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, model: Model, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, options: IBelongsToReflectionOptions);
export function belongsTo(name, model, options) {
    return new BelongsToReflection(name, model, options);
}