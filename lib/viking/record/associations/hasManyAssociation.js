import Model from 'viking/record';
import Relation from 'viking/record/relation';
import HasManyReflection from 'viking/record/reflections/hasManyReflection';

export default class HasManyAssociation {

    owner;//: Model;
    reflection;//: HasManyReflection;
    target = [];//: Model[]
    loaded = false;//: boolean

    // constructor(owner: Model, reflection: HasManyReflection)
    constructor(owner, reflection) {
        this.owner = owner;
        this.reflection = reflection;
    }
    
    instantiate(attributes) {
        this.target = attributes.map((attrs) => this.reflection.model.instantiate(attrs));
        this.loaded = true;
    }

    // setTarget(target: Model[])
    setTarget(target) {
        this.target = target;

        this.target.forEach((m) => {
            m.setAttributes({
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            });
        });

        this.loaded = true;

        // if (target !== null && target.primaryKey()) {
        //     this.owner.setAttributes({
        //         [this.reflection.foreignKey()]: target.primaryKey()
        //     });
        // }
        // return new Proxy(this, {
        //     get: (obj, prop) => {
        //         console.log(prop)
        //         if (/^\d+$/.test(prop) || prop === 'length') {
        //             console.log('a')
        //             return obj.target[prop];
        //         } else {
        //             console.log('b')
        //             return obj[prop];
        //         }
        //     }
        // });
    }
    
    relation() {
        if (this._relation) {
            
        }
    }

    async load() {
        if (!this.loaded) {
            if (this.owner.primaryKey()) {
                this.target = await this.scope().all();
                this.loaded = true;
            } else {
                this.target = [];
                this.loaded = true;
            }
        }
        
        return this.target;
    }
    
    async map(...args) {
        return this.load((records) => records.map(...args));
    }
    
    async forEach(...args) {
        return this.load((records) => records.forEach(...args));
    }

    toArray() {
        return this.load();
    }

    foreignKey() {
        if (this.reflection.options.foreignKey) {
            return this.reflection.options.foreignKey;
        } else if (this.owner.modelName) {
            return this.owner.modelName.paramKey + '_id';
        } else {
            return 'x';
        }
    }

    primaryKey() {
        if (this.reflection.options.primaryKey) {
            return this.reflection.options.primaryKey;
        } else {
            return this.owner.constructor.primaryKey;
        }
    }

    scope() {
        // if (this.reflection.model) {
            let klass = this.reflection.model;
            return klass.where({
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            });
        // }
    }
}