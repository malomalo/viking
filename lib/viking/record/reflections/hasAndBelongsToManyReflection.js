import Record from '../../record';
import Reflection from '../reflection';
import HasAndBelongsToManyAssociation from '../associations/hasAndBelongsToManyAssociation';

// export interface IHasAndBelongsToManyReflectionOptions {
//     foreignKey?: string;
//     associationForeignKey?: string;
//     joinTable?: string;
// }

export default class HasAndBelongsToManyReflection extends Reflection {

    name;//: string;
    model;//: typeof Record;
    options;//: IHasAndBelongsToManyReflectionOptions;

    // constructor(model: typeof Record, options?: IHasAndBelongsToManyReflectionOptions);
    // constructor(name: string, model: Record, options?: IHasAndBelongsToManyReflectionOptions);
    // constructor(name: string, options: IHasAndBelongsToManyReflectionOptions);
    constructor(name, model, scope, options) {
        super();
        this.name = name;
        this.macro = 'hasAndBelongsToMany';
        this.model = model;
        this.scope = scope;
        this.options = options ? options : {};
    }

    // attachTo(model: Record)
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

// export function hasMany(model: typeof Record, options?: IHasAndBelongsToManyReflectionOptions);
// export function hasMany(name: string, model: Record, options?: IHasAndBelongsToManyReflectionOptions);
// export function hasMany(name: string, options: IHasAndBelongsToManyReflectionOptions);
export function hasAndBelongsToMany(name, model, scope, options) {
    if (Record.isPrototypeOf(name)) {
        options = scope;
        scope = model;
        model = name;
        name = model.modelName().plural;
    }
    
    if (typeof scope !== 'function') {
        options = scope;
        scope = null;
    }
    
    return {
        reflection: HasAndBelongsToManyReflection,
        args: [name, model, scope, options]
    };
}