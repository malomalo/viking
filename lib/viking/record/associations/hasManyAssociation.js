import CollectionAssociation from './collectionAssociation';

export default class HasManyAssociation extends CollectionAssociation {

    scope() {
        let klass = this.reflection.model;
        
        let relation = klass.where({
            [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
        })
        
        if (this.reflection.options.as) {
            relation = relation.where({
                [this.foreignType()]: this.owner.modelName.name
            })
        }
        
        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }

        return relation;
    }
    
    setTarget (...args) {
        super.setTarget(...args)
        this.setInverseTarget()
    }
    
    mergeTarget (...args) {
        super.mergeTarget(...args)
        this.setInverseTarget()
    }
    
    setInverseTarget () {
        const inverseOf = this.reflection.options.inverseOf || this.owner.modelName.singular
        if (inverseOf) {
            this.target.forEach(record => {
                const association = record.association(inverseOf)
                if (association) {
                    association.setTarget(this.owner)
                }
            })
        }
    }

}
