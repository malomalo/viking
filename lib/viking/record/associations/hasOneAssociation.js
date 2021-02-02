import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import HasOneReflection from '../reflections/hasOneReflection';

export default class HasOneAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(target) {
        const oldTarget = this.target;
        this.target = target;
        this.loaded = true;
        
        if(target){
            if(this.owner.primaryKey()){
                target.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                });
            }
            this.dispatchEvent('add', target)
            target.dispatchEvent('add', this)
        }
        if(oldTarget) {
            oldTarget.setAttributes({
                [this.reflection.foreignKey()]: null
            });
            this.dispatchEvent('remove', oldTarget)
            oldTarget?.dispatchEvent('remove', this)
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
