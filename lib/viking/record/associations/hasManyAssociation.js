import CollectionAssociation from './collectionAssociation';

export default class HasManyAssociation extends CollectionAssociation {

    scope() {
        let klass = this.reflection.model;
        let relation = klass.where({
            [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
        })
        if (this.reflection.options?.order) {
            relation = relation.order(this.reflection.options?.order)
        }
        return relation;
    }

}
