import Model from 'viking/model';
import Relation from 'viking/record/relation';
import BelongsToReflection from 'viking/record/reflections/belongsToReflection';

export default class BelongsToAssociation {

    owner;//: Model;
    reflection;//: BelongsToReflection;
    target = null;//: Model | null
    loaded= false;//: boolean

    // constructor(owner: Model, reflection: BelongsToReflection)
    constructor(owner, reflection) {
        this.owner = owner;
        this.reflection = reflection;
    }

    instantiate(attributes) {
        this.target = this.reflection.model.instantiate(attributes);
        this.loaded = true;
    }

    // setTarget(target: Model | null)
    setTarget(target) {
        this.target = target;
        this.loaded = true;

        if (target !== null && target !== undefined && target.primaryKey()) {
            this.owner.setAttributes({
                [this.reflection.foreignKey()]: target.primaryKey()
            });
        }
    }

    async load(onFulfilled, onRejected) {
        if (this.loaded) {
            if (onFulfilled) {
                return onFulfilled(this.target);
            } else {
                return this.target;
            }
        } else {
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                return this.scope().first().then((v) => {
                    this.target = v;
                    this.loaded = true;
                    return v;
                }).then(onFulfilled, onRejected);
            } else {
                this.target = null;
                this.loaded = true;
                return new Promise((resolve, reject) => {
                    resolve(this.target);
                }).then(onFulfilled, onRejected);
            }
        }
    }

    scope() {
        // if (this.reflection.model) {
            let klass = this.reflection.model;
            return klass.where({
                [klass.primaryKey]: this.owner.readAttribute(this.reflection.foreignKey())
            });
        // }
    }
}