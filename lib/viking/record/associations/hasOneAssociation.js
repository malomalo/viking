import Model from '../../record';
import Relation from '../relation';
import HasOneReflection from '../reflections/hasOneReflection';

export default class HasOneAssociation {

    owner;//: Model;
    reflection;//: BelongsToReflection;
    target = null;//: Model | null
    loaded = false;//: boolean

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

        if (target !== null && target !== undefined && this.owner.primaryKey()) {
            target.setAttributes({
                [this.reflection.foreignKey()]: this.owner.primaryKey()
            });
        }
    }

    async load() {
        if (!this.loaded) {
            this.target = await this.scope().first();
            this.loaded = true;
        }
        
        return this.target;
    }

    scope() {
        let klass = this.reflection.model;
        return klass.where({
            [this.reflection.foreignKey()]: this.owner.primaryKey()
        });
    }
}