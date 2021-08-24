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

    // setTarget(target: Model[])
    setTarget(target) {
        const merged = this.mergeRecords(this.target, target);

        this.dispatchEvent('beforeAdd', merged.added);
        merged.added.forEach(x => x.dispatchEvent('beforeAdd', this));

        this.dispatchEvent('beforeRemove', merged.removed);
        merged.removed.forEach(x => x.dispatchEvent('beforeRemove', this));
        
        this.target = target;
        this.loaded = true;
        this.dirty = true;
        
        if(merged.added.length > 0) {
            this.dispatchEvent('afterAdd', merged.added);
            merged.added.forEach(x => x.dispatchEvent('afterAdd', this));
        }
        if(merged.removed.length > 0) {
            this.dispatchEvent('afterRemove', merged.removed);
            merged.removed.forEach(x => x.dispatchEvent('afterRemove', this));
        }
    }
    
    // TODO: maybe remove, or add as option in setTarget, maybe merge events as
    // well
    mergeTarget(target) {
        const merged = this.mergeRecords(this.target, target);
        
        this.dispatchEvent('beforeAdd', merged.added);
        merged.added.forEach(x => x.dispatchEvent('beforeAdd', this));
        
        merged.common.forEach(([newRecord, oldRecord]) => {
            oldRecord.setAttributes(newRecord.attributes);
            oldRecord.persist();
        });
        
        this.dispatchEvent('beforeRemove', merged.removed);
        merged.removed.forEach(x => x.dispatchEvent('beforeRemove', this));

        this.target = merged.merged;
        this.loaded = true;
        this.dirty = true;
        
        if(merged.added.length > 0) {
            this.dispatchEvent('afterAdd', merged.added);
            merged.added.forEach(x => x.dispatchEvent('afterAdd', this));
        }
        if(merged.removed.length > 0) {
            this.dispatchEvent('afterRemove', merged.removed);
            merged.removed.forEach(x => x.dispatchEvent('afterRemove', this));
        }
    }
    
    // attributesForSave() {
    //     return this.target.map(record => record.attributesForSave());
    // }
    
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