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

    setTarget(newTarget, {dirty=true, inPlaceUpdate=false}={}) {
        const merged = this.mergeRecords(this.target, newTarget);
        
        if (merged.added.length > 0) { this.dispatchEvent('beforeAdd', merged.added); }
        if (merged.removed.length > 0) { this.dispatchEvent('beforeRemove', merged.removed); }

        this.target.splice(0, this.target.length)
        merged.merged.forEach((a) => {
            if (a[0] === 'added') {
                a[1].dispatchEvent('beforeAdd', this);
                
                this.target.push(a[1])
                a[1].collections.push(this)
                
                a[1].dispatchEvent('afterAdd', this)
            } else if (a[0] == 'removed') {
                a[1].dispatchEvent('beforeRemove', this);
                
                const thisIndex = a[1].collections.findIndex(y => y === this)
                if (thisIndex >= 0) { a[1].collections.splice(thisIndex, 1) }
                
                a[1].dispatchEvent('afterRemove', this)
            } else {
                let record = a[1];
                if (inPlaceUpdate) {
                    record = a[2];
                    record.setAttributes(a[1].attributes);
                }
                if (!dirty) { record.persist(); }
                this.target.push(record)
            }
        });
        this.loaded = true;
        this.dirty = dirty;
        
        if (merged.added.length > 0) { this.dispatchEvent('afterAdd', merged.added); }
        if (merged.removed.length > 0) { this.dispatchEvent('afterRemove', merged.removed); }
    }

    
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