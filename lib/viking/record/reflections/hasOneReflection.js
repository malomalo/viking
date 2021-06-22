import Record from '../../record';
import Reflection from '../reflection';
import HasOneAssociation from '../associations/hasOneAssociation';
import {neverEndingProxy} from './helpers';

export default class HasOneReflection extends Reflection {

    name;//: string;
    model;//: typeof Model;
    options;//: IBelongsToReflectionOptions;

    // constructor(model: typeof Model, options?: IBelongsToReflectionOptions);
    // constructor(name: string, model: Model, options?: IBelongsToReflectionOptions);
    // constructor(name: string, options: IBelongsToReflectionOptions);
    constructor(name, model, scope, options) {
        super();
        this.name = name || model.modelName().singular;
        this.macro = 'hasOne';
        this.model = model || (options ? options.model : undefined);
        this.scope = scope;
        this.options = options || {};
    }

    // attachTo(model: Model)
    attachTo(model) {
        this.klass = model;
        let association = new HasOneAssociation(model, this);

        Object.defineProperty(model, this.name, {
            get: () => {
                if (association.loaded) {
                    return association.target;
                } else {
                    return neverEndingProxy(association.load())
                }
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
        } else if (this.options.as) {
            return this.options.as + '_id';
        } else {
            return this.klass.modelName.paramKey + '_id';
        }
    }
    
    foreignType () {
        if (this.options.foreignType) {
            return this.options.foreignType;
        } else if (this.options.as) {
            return this.options.as + '_type';
        } else if (this.klass.modelName) {
            return this.klass.modelName.paramKey + '_type';
        } else {
            return 'x';
        }
    }
}

// export function belongsTo(model: typeof Model, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, model: Model, options?: IBelongsToReflectionOptions);
// export function belongsTo(name: string, options: IBelongsToReflectionOptions);
export function hasOne(name, model, scope, options) {
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
        reflection: HasOneReflection,
        args: [name, model, scope, options]
    };
}