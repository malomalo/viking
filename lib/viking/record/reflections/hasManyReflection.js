import Record from '../../record';
import Reflection from '../reflection';
import HasManyAssociation from '../associations/hasManyAssociation';

// export interface IHasManyReflectionOptions {
//     foreignKey?: string;
//     primaryKey?: string;
//     // as?: string;
//     // through?: string;
//     // source?: string
//     // sourceType?: string
// }

export default class HasManyReflection extends Reflection {

    name;//: string;
    model;//: typeof Model;
    options;//: IHasManyReflectionOptions;

    // constructor(model: typeof Model, options?: IHasManyReflectionOptions);
    // constructor(name: string, model: Model, options?: IHasManyReflectionOptions);
    // constructor(name: string, options: IHasManyReflectionOptions);
    constructor(name, model, options) {
        if (Record.isPrototypeOf(name)) {
            options = model;
            model = name;
            name = model.modelName().plural;
        } else if (!Record.isPrototypeOf(model)) {
            options = model;
            model = undefined;
        }

        super();
        this.name = name;
        this.macro = 'hasMany';
        this.model = model;
        this.options = options ? options : {};
    }

    // attachTo(model: Model)
    attachTo(model) {
        let association = new HasManyAssociation(model, this);

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

// export function hasMany(model: typeof Model, options?: IHasManyReflectionOptions);
// export function hasMany(name: string, model: Model, options?: IHasManyReflectionOptions);
// export function hasMany(name: string, options: IHasManyReflectionOptions);
export function hasMany(name, model, options) {
    return {
        reflection: HasManyReflection,
        args: [name, model, options]
    };
}