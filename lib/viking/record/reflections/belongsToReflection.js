import Record from '../../record';
import Reflection from '../reflection';
import BelongsToAssociation from '../associations/belongsToAssociation';
import {neverEndingProxy} from './helpers';

// export interface IBelongsToReflectionOptions {
//     foreignKey?: string;
//     foreignType?: string;
//     polymorphic?: typeof Record[];
// }


export default class BelongsToReflection extends Reflection {

    name;//: string;
    model;//: typeof Record;
    options;//: IBelongsToReflectionOptions;

    // constructor(model: typeof Record, options?: IBelongsToReflectionOptions);
    // constructor(name: string, model: Record, options?: IBelongsToReflectionOptions);
    // constructor(name: string, options: IBelongsToReflectionOptions);
    constructor(name, model, scope, options) {
        super();
        this.name = name;
        this.macro = 'belongsTo';
        this.model = model || (options ? options.model : undefined);
        this.polymorphic = options ? options.polymorphic : undefined;
        this.scope = scope;
        this.options = options || {};
    }

    // attachTo(model: Record)
    attachTo(model) {
        let association = new BelongsToAssociation(model, this);

        Object.defineProperty(model, this.name, {
            get: () => {
                if (association.loaded) {
                    return association.target;
                }
                
                if (!association.owner.readAttribute(association.reflection.foreignKey())) {
                    return null;
                }

                return neverEndingProxy(association.load())
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
        } else if (this.name) {
            return this.name + `_id`
        } else {
            return this.model.modelName().paramKey + '_id';
        }
    }
    
    foreignType() {
        if (this.polymorphic) {
            return this.options.foreign_type ? this.options.foreign_type : `${this.name}_type`
        }
    }
}

// export function belongsTo(model: typeof Record, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, model: Record, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, options: IBelongsToReflectionOptions);
export function belongsTo(name, model, scope, options) {
    if (Record.isPrototypeOf(name)) {
        options = scope;
        scope = model;
        model = name;
        name = model.modelName().singular;
    }
    
    if (!Record.isPrototypeOf(model)) {
        options = scope;
        scope =  model;
    }
    
    if (typeof scope !== 'function') {
        options = scope;
        scope = null;
    }

    return {
        reflection: BelongsToReflection,
        args: [name, model, scope, options]
    };
}