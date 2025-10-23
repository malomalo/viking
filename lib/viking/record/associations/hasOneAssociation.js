import Model from '../../record.js';
import Relation from '../relation.js';
import Association from '../association.js';
import HasOneReflection from '../reflections/hasOneReflection.js';

export default class HasOneAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(newTarget, {dirty=true, inPlaceUpdate=false}={}) {
        const oldTarget = this.target;
        
        if (inPlaceUpdate && oldTarget && newTarget && oldTarget.primaryKey() == newTarget.primaryKey()) {
            oldTarget.setAttributes(newTarget.attributes);
            oldTarget.persist();
            if(this.owner.primaryKey()){
                oldTarget.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                });
            }
            this.loaded = true;
            this.dirty = dirty;
        } else {
            if (newTarget) {
                this.dispatchEvent('beforeAdd', newTarget)
                newTarget.dispatchEvent('beforeAdd', this)
            }
            if (oldTarget) {
                this.dispatchEvent('beforeRemove', oldTarget)
                oldTarget.dispatchEvent('beforeRemove', this)
            }
            
            this.target = newTarget;
            this.loaded = true;
            this.dirty = dirty;

            if(newTarget){
                if(this.owner.primaryKey()){
                    newTarget.setAttributes({
                        [this.reflection.foreignKey()]: this.owner.primaryKey()
                    });
                }
                this.dispatchEvent('afterAdd', newTarget)
                newTarget.dispatchEvent('afterAdd', this)
            }
            if(oldTarget) {
                oldTarget.setAttributes({
                    [this.reflection.foreignKey()]: null
                });
                this.dispatchEvent('afterRemove', oldTarget)
                oldTarget.dispatchEvent('afterRemove', this)
            }
        }
    }

    async load() {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target);
            this.setTarget(await this.scope().first(), {dirty: false, inPlaceUpdate: true});
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
                [this.reflection.foreignType()]: this.owner.baseClass.modelName().name
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
