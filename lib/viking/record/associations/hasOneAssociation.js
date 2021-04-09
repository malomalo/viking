import Model from '../../record';
import Relation from '../relation';
import Association from '../association';
import HasOneReflection from '../reflections/hasOneReflection';

export default class HasOneAssociation extends Association {

    // setTarget(target: Model | null)
    setTarget(target) {
        const oldTarget = this.target;
        
        if (target) {
            this.dispatchEvent('onadd', target)
            target.dispatchEvent('onadd', this)
        }
        if (oldTarget) {
            this.dispatchEvent('onremove', oldTarget)
            oldTarget.dispatchEvent('onremove', this)
        }
        
        this.target = target;
        this.loaded = true;
        
        if(target){
            if(this.owner.primaryKey()){
                target.setAttributes({
                    [this.reflection.foreignKey()]: this.owner.primaryKey()
                });
            }
            this.dispatchEvent('added', target)
            target.dispatchEvent('added', this)
        }
        if(oldTarget) {
            oldTarget.setAttributes({
                [this.reflection.foreignKey()]: null
            });
            this.dispatchEvent('removed', oldTarget)
            oldTarget.dispatchEvent('removed', this)
        }
    }

    async load() {
        this.dispatchEvent('onload', this.target)
        if (!this.loaded) {
            this.target = await this.scope().first();
            this.loaded = true;
        }
        
        this.dispatchEvent('loaded', this.target)
        return this.target;
    }

    scope() {
        let klass = this.reflection.model;

        let relation = klass.where({
            [this.reflection.foreignKey()]: this.owner.primaryKey()
        });
        
        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }
        
        return relation;
    }
}
