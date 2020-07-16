import Model from 'viking/record';
import Reflection from 'viking/record/reflection';
import HasAndBelongsToManyAssociation from 'viking/record/associations/hasAndBelongsToManyAssociation';

// export interface IHasAndBelongsToManyReflectionOptions {
//     foreignKey?: string;
//     associationForeignKey?: string;
//     joinTable?: string;
// }

export default class HasAndBelongsToManyReflection extends Reflection {

    name;//: string;
    model;//: typeof Model;
    options;//: IHasAndBelongsToManyReflectionOptions;

    // constructor(model: typeof Model, options?: IHasAndBelongsToManyReflectionOptions);
    // constructor(name: string, model: Model, options?: IHasAndBelongsToManyReflectionOptions);
    // constructor(name: string, options: IHasAndBelongsToManyReflectionOptions);
    constructor(name, model, options) {
        if (Model.isPrototypeOf(name)) {
            options = model;
            model = name;
            name = model.modelName().plural;
        } else {
            options = model;
            model = undefined;
        }

        super();
        this.name = name;
        this.macro = 'hasAndBelongsToMany';
        this.model = model;
        this.options = options ? options : {};
    }

    // attachTo(model: Model)
    attachTo(model) {
        let association = new HasAndBelongsToManyAssociation(model, this);

        Object.defineProperty(model, this.name, {
            get: () => {
                return association;
            },
            set: (target) => {
                association.setTarget(target);
            }
        });

        return association;
    }

}

// export function hasMany(model: typeof Model, options?: IHasAndBelongsToManyReflectionOptions);
// export function hasMany(name: string, model: Model, options?: IHasAndBelongsToManyReflectionOptions);
// export function hasMany(name: string, options: IHasAndBelongsToManyReflectionOptions);
export function hasAndBelongsToMany(name, model, options) {
    return new HasAndBelongsToManyReflection(name, model, options);
}