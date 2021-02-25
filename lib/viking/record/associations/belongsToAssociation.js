import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import BelongsToReflection from '../reflections/belongsToReflection';

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
        
        this.target = target;
        this.loaded = true;
        
        if (target) {
            if(target.primaryKey()){
                this.owner.setAttributes({
                    [this.reflection.foreignKey()]: target.primaryKey()
                });
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
    
    async load() {
        this.dispatchEvent('onload', this.target)
        if (!this.loaded) {
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                this.target = await this.scope().first();
                this.loaded = true;
            } else {
                this.target = null;
                this.loaded = true;
            }
        }
        this.dispatchEvent('loaded', this.target);
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
