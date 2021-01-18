import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import HasOneReflection from '../reflections/hasOneReflection';

export default class HasOneAssociation extends Association {

    instantiate(attributes) {
        this.target = this.reflection.model.instantiate(attributes);
        this.loaded = true;
    }

    // setTarget(target: Model | null)
    setTarget(target) {
        const oldTarget = this.target;
        this.target = target;
        this.loaded = true;

        if (target !== null && target !== undefined && this.owner.primaryKey()) {
            target.setAttributes({
                [this.reflection.foreignKey()]: this.owner.primaryKey()
            });
        }
        
        if(target){
            this.dispatchEvent('add', target)
        } else {
            this.dispatchEvent('remove', oldTarget)
        }
    }

    async load() {
        if (!this.loaded) {
            this.target = await this.scope().first();
            this.loaded = true;
        }
        
        this.dispatchEvent('load', this.target)
        return this.target;
    }

    scope() {
        let klass = this.reflection.model;
        return klass.where({
            [this.reflection.foreignKey()]: this.owner.primaryKey()
        });
    }
}