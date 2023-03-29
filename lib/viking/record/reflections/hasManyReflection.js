import Record from '../../record.js';
import Reflection from '../reflection.js';
import HasManyAssociation from '../associations/hasManyAssociation.js';

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
    constructor(name, model, scope, options) {
        super();
        this.name = name || model.modelName().plural;
        this.macro = 'hasMany';
        this.model = model;
        this.scope = scope;
        this.options = options ? options : {};
    }

    // attachTo(model: Model)
    attachTo(model) {
        let association = new HasManyAssociation(model, this);

        Object.defineProperty(model, this.name, {
            get: () => association,
            set: (target) => association.setTarget(target)
        });

        return association;
    }

}

// export function hasMany(model: typeof Model, options?: IHasManyReflectionOptions);
// export function hasMany(name: string, model: Model, options?: IHasManyReflectionOptions);
// export function hasMany(name: string, options: IHasManyReflectionOptions);
export function hasMany(name, model, scope, options) {
    if (typeof name !== 'string') {
        options = scope;
        scope = model;
        model = name;
        name = undefined;
    }
    
    if (typeof scope !== 'function') {
        options = scope;
        scope = null;
    }

    return {
        reflection: HasManyReflection,
        args: [name, model, scope, options]
    };
}