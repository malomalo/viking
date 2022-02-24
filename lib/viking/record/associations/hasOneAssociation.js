import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import HasOneReflection from '../reflections/hasOneReflection';

export default class HasOneAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(target, dirty=true) {
        const oldTarget = this.target;
        
        if (target) {
            this.dispatchEvent('beforeAdd', target)
            target.dispatchEvent('beforeAdd', this)
        }
        if (oldTarget) {
            this.dispatchEvent('beforeRemove', oldTarget)
            oldTarget.dispatchEvent('beforeRemove', this)
        }
        
        this.target = target;
        this.loaded = true;
        this.dirty = dirty;
        
        if(target){
            if(this.owner.primaryKey()){
                target.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                });
            }
            this.dispatchEvent('afterAdd', target)
            target.dispatchEvent('afterAdd', this)
        }
        if(oldTarget) {
            oldTarget.setAttributes({
                [this.reflection.foreignKey()]: null
            });
            this.dispatchEvent('afterRemove', oldTarget)
            oldTarget.dispatchEvent('afterRemove', this)
        }
    }

    mergeTarget(target, dirty=true) {
        if (this.target && target && this.target.primaryKey() == target.primaryKey()) {
            this.target.setAttributes(target.attributes);
            this.target.persist();
            if(this.owner.primaryKey()){
                target.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                });
            }
        } else {
            this.setTarget(target, dirty);
        }
    }

    async load() {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target);
            this.mergeTarget(await this.scope().first(), false);
            this.dispatchEvent('afterLoad', this.target);
        }
        
        return this.target;
    }

    scope() {
        let klass = this.reflection.model;

        let relation = klass.where({
            [this.reflection.foreignKey()]: this.owner.primaryKey()
        }).limit(1);
        
        if (this.reflection.options.as) {
            relation = relation.where({
                [this.reflection.foreignType()]: this.owner.modelName.name
            })
        }
        
        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }
        
        return relation;
    }
    
    foreignKey() {
        return this.reflection.foreignKey()
    }
    
    foreignType() {
        return this.reflection.foreignType()
    }
    
    attributesForSave() {
        if (!this.target) {
            return null;
        }
        
        const attributes = this.target.attributesForSave();
        if (this.target.isPersisted()) {
            attributes[this.target.constructor.primaryKey] = this.target.primaryKey()
        }
        delete attributes[this.foreignKey()];
        return attributes;
    }

}
