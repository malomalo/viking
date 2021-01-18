import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import BelongsToReflection from '../reflections/belongsToReflection';

export default class BelongsToAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(target) {
        const oldTarget = this.target
        this.target = target;
        this.loaded = true;

        if (target !== null && target !== undefined && target.primaryKey()) {
            this.owner.setAttributes({
                [this.reflection.foreignKey()]: target.primaryKey()
            });
        } 
        if (target) {
            this.dispatchEvent('add', target);
        } else {
            this.dispatchEvent('remove', oldTarget);
        }
    }
    
    async load() {
        if (!this.loaded) {
            if (this.owner.readAttribute(this.reflection.foreignKey())) {
                this.target = await this.scope().first();
                this.loaded = true;
            } else {
                this.target = null;
                this.loaded = true;
            }
        }
        this.dispatchEvent('load', this.target);
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