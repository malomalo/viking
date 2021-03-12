import CollectionAssociation from './collectionAssociation';

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
    
    scope() {
        let klass = this.reflection.model;
        return klass.where({
            [this.joinTable()]: {
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            }
        });
    }

}