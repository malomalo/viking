import CollectionAssociation from './collectionAssociation';

export default class HasManyAssociation extends CollectionAssociation {

    scope() {
        let klass = this.reflection.model;
        
        let relation = klass.where({
            [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
        })
        
        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }

        return relation;
    }

}
