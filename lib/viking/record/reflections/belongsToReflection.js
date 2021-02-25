import Model from '../../record';
import Reflection from '../reflection';
import BelongsToAssociation from '../associations/belongsToAssociation';

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
                if (association.loaded) {
                    return association.target;
                }

                return new Proxy(association, {
                    get: (target, prop, receiver) => {
                        if ( prop === 'then' ) {
                            let p = target.load();
                            return p.then.bind(p);
                        } else {
                            if (typeof association.reflection.model.prototype[prop] === 'function') {
                                return (...args) => {
                                    return target.load().then((loaded_target) => {
                                        return loaded_target[prop](...args);
                                    });
                                }
                            } else {
                                return target.load().then(loaded_target => {
                                    return loaded_target[prop];
                                });
                            }
                        }
                    }
                });
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
}

// export function belongsTo(model: typeof Model, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, model: Model, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, options: IBelongsToReflectionOptions);
export function belongsTo(name, model, options) {
    return {
        reflection: BelongsToReflection,
        args: [name, model, options]
    };
}