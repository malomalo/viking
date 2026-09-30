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
    // `dirty` is accepted for parity with the other associations but unused.
    setTarget(newTarget, {dirty, inPlaceUpdate=false, ...details}={}) {
        const oldTarget = this.target

        // Update the current target if this is not a polymorphic relation or the
        // "Class"es match
        if (
            inPlaceUpdate &&
            oldTarget && newTarget &&
            oldTarget.primaryKey() == newTarget.primaryKey() &&
            (!this.reflection.polymorphic || oldTarget.modelName.name == newTarget.modelName.name)
        ) {
            oldTarget.setAttributes(newTarget.attributes, details);
            oldTarget.persist();
            this.loaded = true;
        } else {
            if (newTarget) {
                newTarget.dispatchEvent('beforeAdd', this, details);
                this.dispatchEvent('beforeAdd', newTarget, details);
            }
            if (oldTarget) {
                oldTarget.dispatchEvent('beforeRemove', this, details);
                this.dispatchEvent('beforeRemove', oldTarget, details);
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
                        this.owner.setAttributes(attributes, details);
                    }
                    this.dispatchEvent('afterAdd', newTarget, details);
                    newTarget.dispatchEvent('afterAdd', this, details);
                } else {
                    this.owner.setAttributes({
                        [this.reflection.foreignKey()]: null
                    }, details);
                    this.dispatchEvent('afterRemove', oldTarget, details);
                    oldTarget?.dispatchEvent('afterRemove', this, details);
                }
            }
        }
    }

    async load({...details}={}) {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target, details);
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                this.setTarget(await this.scope().first(), {...details, inPlaceUpdate: true});
            } else {
                this.setTarget(null, details)
            }
            this.dispatchEvent('afterLoad', this.target, details);
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
    
}
