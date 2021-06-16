import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import BelongsToReflection from '../reflections/belongsToReflection';
import {ClassNotFound} from '../../errors';

export default class BelongsToAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(target) {
        const oldTarget = this.target
        if (target) {
            target.dispatchEvent('onadd', this);
            this.dispatchEvent('onadd', target);
        }
        if (oldTarget) {
            oldTarget.dispatchEvent('onremove', this);
            this.dispatchEvent('onremove', oldTarget);
        }
        
        if (target?.cid != this.target?.cid) {
            this.target = target;
            if (target) {
                if(target.primaryKey()){
                    let attributes = {
                        [this.reflection.foreignKey()]: target.primaryKey()
                    };
                    if (this.reflection.polymorphic) {
                        attributes[this.reflection.foreignType()] = target.modelName.name;
                    }
                    this.owner.setAttributes(attributes);
                }
                this.dispatchEvent('added', target);
                target.dispatchEvent('added', this);
            } else {
                this.owner.setAttributes({
                    [this.reflection.foreignKey()]: null
                });
                this.dispatchEvent('removed', oldTarget);
                oldTarget?.dispatchEvent('removed', this);
            }
        }

        this.loaded = true;
    }
    
    mergeTarget(target) {
        if (this.target && target && this.target.primaryKey() == target.primaryKey()) {
            // Update the current target if this is not a polymorphic relation
            // or the "Class"es match
            if (!this.reflection.polymorphic || this.target.modelName.name == target.modelName.name) {
                this.target.setAttributes(target.attributes);
                this.target.persist();
            } else {
                this.setTarget(target);
            }
        } else {
            this.setTarget(target);
        }
    }
    
    async load() {
        if (!this.loaded) {
            this.dispatchEvent('onload', this.target);
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                this.mergeTarget(await this.scope().first());
            } else {
                this.setTarget(null)
            }
            this.dispatchEvent('loaded', this.target);
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
}
