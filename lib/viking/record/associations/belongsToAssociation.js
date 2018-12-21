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

    load() {
        if (this.loaded) {
            return new Promise((resolve, reject) => {
                resolve(this.target);
            });
        } else {
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                return this.scope().first().then((v) => {
                    this.target = v;
                    this.loaded = true;
                    return v;
                });
            } else {
                this.target = null;
                this.loaded = true;
                return new Promise((resolve, reject) => {
                    resolve(this.target);
                });
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