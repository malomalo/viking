import CollectionAssociation from './collectionAssociation.js';

export default class HasAndBelongsToManyAssociation extends CollectionAssociation {

    joinTable() {
        if (this.reflection.options.joinTable) {
            return this.reflection.options.joinTable;
        } else if (this.owner.modelName) {
            return [this.owner.modelName.plural, this.reflection.model.modelName().plural].sort().join('_');
        } else {
            return 'x';
        }
    }

    // The join table holds the foreign key, not the associated record, so
    // adding or removing a record must not write one onto it.
    setForeignKey(record) {}

    unsetForeignKey(record) {}

    scope() {
        let klass = this.reflection.model;
        
        let relation = klass.where({
            [this.joinTable()]: {
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            }
        });

        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }
        
        return relation;
    }

}