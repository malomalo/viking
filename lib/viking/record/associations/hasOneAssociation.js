import Model from '../../record.js';
import Relation from '../relation.js';
import Association from '../association.js';
import HasOneReflection from '../reflections/hasOneReflection.js';

export default class HasOneAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(newTarget, {dirty=true, inPlaceUpdate=false, eventParameters={}}={}) {
        const oldTarget = this.target;

        if (inPlaceUpdate && oldTarget && newTarget && oldTarget.primaryKey() == newTarget.primaryKey()) {
            oldTarget.setAttributes(newTarget.attributes, {eventParameters});
            oldTarget.persist();
            if(this.owner.primaryKey()){
                oldTarget.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                }, {eventParameters});
            }
            this.loaded = true;
            this.dirty = dirty;
        } else {
            if (newTarget) {
                this.dispatchEvent('beforeAdd', newTarget, eventParameters)
                newTarget.dispatchEvent('beforeAdd', this, eventParameters)
            }
            if (oldTarget) {
                this.dispatchEvent('beforeRemove', oldTarget, eventParameters)
                oldTarget.dispatchEvent('beforeRemove', this, eventParameters)
            }

            this.target = newTarget;
            this.loaded = true;
            this.dirty = dirty;

            if(newTarget){
                if(this.owner.primaryKey()){
                    newTarget.setAttributes({
                        [this.reflection.foreignKey()]: this.owner.primaryKey()
                    }, {eventParameters});
                }
                this.dispatchEvent('afterAdd', newTarget, eventParameters)
                newTarget.dispatchEvent('afterAdd', this, eventParameters)
            }
            if(oldTarget) {
                oldTarget.setAttributes({
                    [this.reflection.foreignKey()]: null
                }, {eventParameters});
                this.dispatchEvent('afterRemove', oldTarget, eventParameters)
                oldTarget.dispatchEvent('afterRemove', this, eventParameters)
            }
        }
    }

    async load({eventParameters={}}={}) {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target, eventParameters);
            this.setTarget(await this.scope().first(), {eventParameters, dirty: false, inPlaceUpdate: true});
            this.dispatchEvent('afterLoad', this.target, eventParameters);
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
