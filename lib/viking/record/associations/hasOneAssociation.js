import Model from '../../record.js';
import Relation from '../relation.js';
import Association from '../association.js';
import HasOneReflection from '../reflections/hasOneReflection.js';

export default class HasOneAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(newTarget, {dirty=true, inPlaceUpdate=false, ...details}={}) {
        const oldTarget = this.target;

        if (inPlaceUpdate && oldTarget && newTarget && oldTarget.primaryKey() == newTarget.primaryKey()) {
            oldTarget.setAttributes(newTarget.attributes, details);
            oldTarget.persist();
            if(this.owner.primaryKey()){
                oldTarget.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                }, details);
            }
            this.loaded = true;
            this.dirty = dirty;
        } else {
            if (newTarget) {
                this.dispatchEvent('beforeAdd', newTarget, details)
                newTarget.dispatchEvent('beforeAdd', this, details)
            }
            if (oldTarget) {
                this.dispatchEvent('beforeRemove', oldTarget, details)
                oldTarget.dispatchEvent('beforeRemove', this, details)
            }

            this.target = newTarget;
            this.loaded = true;
            this.dirty = dirty;

            if(newTarget){
                if(this.owner.primaryKey()){
                    newTarget.setAttributes({
                        [this.reflection.foreignKey()]: this.owner.primaryKey()
                    }, details);
                }
                this.dispatchEvent('afterAdd', newTarget, details)
                newTarget.dispatchEvent('afterAdd', this, details)
            }
            if(oldTarget) {
                oldTarget.setAttributes({
                    [this.reflection.foreignKey()]: null
                }, details);
                this.dispatchEvent('afterRemove', oldTarget, details)
                oldTarget.dispatchEvent('afterRemove', this, details)
            }
        }
    }

    async load({...details}={}) {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target, details);
            this.setTarget(await this.scope().first(), {...details, dirty: false, inPlaceUpdate: true});
            this.dispatchEvent('afterLoad', this.target, details);
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
    
}
