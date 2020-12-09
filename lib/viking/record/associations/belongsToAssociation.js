import Model from '../../record';
import Relation from '../relation';
import BelongsToReflection from '../reflections/belongsToReflection';

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

    async load() {
        if (!this.loaded) {
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                this.target = await this.scope().first();
                this.loaded = true;
            } else {
                this.target = null;
                this.loaded = true;
            }
        }
        
        return this.target;
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