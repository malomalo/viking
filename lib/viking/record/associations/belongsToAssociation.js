import Model from '../../record.js';
import Relation from '../relation.js';
import Association from '../association.js';
import BelongsToReflection from '../reflections/belongsToReflection.js';
import {ClassNotFound} from '../../errors.js';

export default class BelongsToAssociation extends Association {
    
    instantiate(attributes) {
        if (attributes) {
            let klass = this.reflection.model
            if (this.reflection.options.polymorphic) {
                let foreignKlassName = this.owner.readAttribute(this.reflection.foreignType());
                klass = this.reflection.polymorphic.find(m => m.modelName().name === foreignKlassName);
                if (!klass) {
                    throw new ClassNotFound(`Could not find class "${foreignKlassName}" in polymorphic relation ${this.owner.modelName.name}#${this.reflection.name}`);
                }
            }

            this.target = klass.instantiate(attributes)
        } else {
            this.target = null
        }
        this.loaded = true;
        this.dirty = false;
    }

    // setTarget(target: Model | null)
    setTarget(newTarget, {inPlaceUpdate=false}={}) {
        const oldTarget = this.target
        
        // Update the current target if this is not a polymorphic relation or the
        // "Class"es match
        if (
            inPlaceUpdate &&
            oldTarget && newTarget &&
            oldTarget.primaryKey() == newTarget.primaryKey() &&
            (!this.reflection.polymorphic || oldTarget.modelName.name == newTarget.modelName.name)
        ) {
            oldTarget.setAttributes(newTarget.attributes);
            oldTarget.persist();
            this.loaded = true;
        } else {
            if (newTarget) {
                newTarget.dispatchEvent('beforeAdd', this);
                this.dispatchEvent('beforeAdd', newTarget);
            }
            if (oldTarget) {
                oldTarget.dispatchEvent('beforeRemove', this);
                this.dispatchEvent('beforeRemove', oldTarget);
            }
            
            this.loaded = true;
            
            if (newTarget?.cid != oldTarget?.cid) {
                this.target = newTarget;
                if (newTarget) {
                    if(newTarget.primaryKey()){
                        let attributes = {
                            [this.reflection.foreignKey()]: newTarget.primaryKey()
                        };
                        if (this.reflection.polymorphic) {
                            attributes[this.reflection.foreignType()] = newTarget.modelName.name;
                        }
                        this.owner.setAttributes(attributes);
                    }
                    this.dispatchEvent('afterAdd', newTarget);
                    newTarget.dispatchEvent('afterAdd', this);
                } else {
                    this.owner.setAttributes({
                        [this.reflection.foreignKey()]: null
                    });
                    this.dispatchEvent('afterRemove', oldTarget);
                    oldTarget?.dispatchEvent('afterRemove', this);
                }
            }
        }
    }
    
    async load() {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target);
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                this.setTarget(await this.scope().first(), {inPlaceUpdate: true});
            } else {
                this.setTarget(null)
            }
            this.dispatchEvent('afterLoad', this.target);
        }
        
        return this.target;
    }

    scope() {
        let klass;
        
        if (this.reflection.polymorphic) {
            let foreignKlassName = this.owner.readAttribute(this.reflection.foreignType());
            klass = this.reflection.polymorphic.find(m => m.modelName().name === foreignKlassName);
            if (!klass) {
                throw new ClassNotFound(`Could not find class "${foreignKlassName}" in polymorphic relation ${this.owner.modelName.name}#${this.reflection.name}`);
            }

        } else {
            klass = this.reflection.model;
        }
            
        let relation = klass.where({
            [klass.primaryKey]: this.owner.readAttribute(this.reflection.foreignKey())
        });
        
        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }
        
        return relation;
    }
    
    needsSaved() {
        return (this.target?.needsSaved())
    }
    
    attributesForSave() {
        const attributes = this.target.attributesForSave();
        if (this.target.isPersisted()) {
            attributes[this.target.constructor.primaryKey] = this.target.primaryKey()
        }
        return attributes;
    }

}
