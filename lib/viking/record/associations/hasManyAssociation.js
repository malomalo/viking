import CollectionAssociation from './collectionAssociation';

export default class HasManyAssociation extends CollectionAssociation {

    scope() {
        let klass = this.reflection.model;
        return klass.where({
            [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
        });
    }

}
