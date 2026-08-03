import Association from '../association.js';
import Record from '../../record.js';
import {RecordNotSaved} from '../../errors.js';
import {isEqual, pick, last, isPlainObject} from '../../support.js';

export default class CollectionAssociation extends Association {

    target = [];//: Model[]
    isCollection = true;
    
    instantiate(attributes) {
        this.target = attributes.map((attrs) => this.reflection.model.instantiate(attrs));
        this.loaded = true;
        this.dirty = false;
    }

    mergeRecords(oldRecords, newRecords) {
        const addedRecords      = [];
        const commonRecords     = [];
        const removedRecords    = [];
        const modificationArray = [];
        const deletedOldIndexes = oldRecords.map((r,i) => i);
        
        const newToOldIndexes = newRecords.map((newRecord) => {
            const oldIndex = oldRecords.findIndex((y) => {
                if (newRecord instanceof Record) {
                    return this.isMatchingRecord(y, newRecord)
                } else {
                    return this.isAttributesForRecord(y, newRecord)
                }
            });
            return oldIndex
        });

        newToOldIndexes.forEach((oldIndex, newIndex) => {
            if (oldIndex < 0) {
                modificationArray.push(['added', newRecords[newIndex]])
                addedRecords.push(newRecords[newIndex])
            } else {
                if (oldIndex == newIndex) {
                    modificationArray.push(['common', newRecords[newIndex], oldRecords[oldIndex]])
                } else {
                    modificationArray.push(['moved', newRecords[newIndex], oldRecords[oldIndex]])
                }
                commonRecords.push(oldRecords[oldIndex])
                
                const removeUntil = deletedOldIndexes.findLastIndex((i) => i == oldIndex)
                if (removeUntil >= 0) {
                    deletedOldIndexes.splice(0, removeUntil).forEach((i) => {
                        modificationArray.push(['removed', oldRecords[i]])
                        removedRecords.push(oldRecords[i])
                    })
                    deletedOldIndexes.splice(0, 1)
                }
            }
        })

        deletedOldIndexes.forEach((i) => {
            modificationArray.push(['removed', oldRecords[i]])
            removedRecords.push(oldRecords[i])
        })

        return {
            merged: modificationArray,
            added: addedRecords,
            common: commonRecords,
            removed: removedRecords
        };
    }
    
    isMatchingRecord(recordA, recordB) {
        if (recordB.primaryKey() && recordB.primaryKey() === recordA.primaryKey()) {
            return true
        } else if (recordA.cid === recordB.cid) {
            return true
        // } else if (recordB.isNewRecord()) {
        //     return isEqual(recordB.attributes, pick(recordA.attributes, Object.keys(recordB.attributes)))
        }
        return false;
    }
    
    isAttributesForRecord(record, attributes) {
        const key = attributes[this.reflection.model.primaryKey];
        if (key && key === record.primaryKey()) {
            return true
        } else if (record.isNewRecord()) {
            return isEqual(record.attributes, pick(attributes, Object.keys(record.attributes)))
        }
        return false;
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
                this.setForeignKey(a[1]);
                a[1].collections.add(this)

                a[1].dispatchEvent('afterAdd', this)
            } else if (a[0] == 'removed') {
                a[1].dispatchEvent('beforeRemove', this);

                this.unsetForeignKey(a[1]);
                const thisIndex = a[1].collections.delete(this);

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
    
    async load() {
        if (this.loaded) { return this.target; }
        
        if (this.loading) {
            await this.loading;
            return this.target;
        }
        
        this.dispatchEvent('beforeLoad', this.target);

        if (this.owner.primaryKey()) {
            this.loading = this.scope().all().then((records) => {
                this.loading = null;
                this.setTarget(records, {dirty: false, inPlaceUpdate: true});
                this.dispatchEvent('afterLoad', this.target);
            });
        
            await this.loading;
            return this.target;
        } else {
            this.setTarget([], {dirty: false});
            this.dispatchEvent('afterLoad', this.target);
            return this.target;
        }
    }
    
    async map(...args) {
        const records = await this.load();
        return records.map(...args);
    }

    async filter(...args) {
        const records = await this.load();
        return records.filter(...args);
    }

    async find(...args) {
        const records = await this.load();
        return records.find(...args);
    }

    async includes(...args) {
        const records = await this.load();
        return records.includes(...args);
    }

    async some(...args) {
        const records = await this.load();
        return records.some(...args);
    }

    async every(...args) {
        const records = await this.load();
        return records.every(...args);
    }

    async reduce(...args) {
        const records = await this.load();
        return records.reduce(...args);
    }

    async forEach(...args) {
        const records = await this.load();
        return records.forEach(...args);
    }

    async length () {
        const records = await this.load();
        return records.length;
    }
    
    async add (record, options) {
        return this.push(record)
    }
    
    async push (record) {
        const match = await this.find(x => {
            if (record.primaryKey()) {
                return x.primaryKey() == record.primaryKey()
            } else {
                return x.cid == record.cid
            }
        })
        if (!match){
            this.setTarget(this.target.concat([record]))
        }
    }
    
    async remove (record, options) {
        this.setTarget(await this.filter(x => {
            if (record.primaryKey()) {
                return x.primaryKey() != record.primaryKey()
            } else {
                return x.cid != record.cid
            }
        }))
    }
    
    addBang(record, options={}) {
        if (!this.owner.isPersisted()) {
            throw new RecordNotSaved("Failed to add the record because the parent is not presisted");
        }
        
        options.label = `${this.owner.modelName.name}[${this.owner.cid}].${this.reflection.name}[${this.cid}] addBang`

        options.method = 'POST'
        if (record.isPersisted()) {
            options.invalid = (response, error_callback) => {
                if (response.getResponseHeader('Content-Type').startsWith('application/json')) {
                    const errors = JSON.parse(response.responseText).errors;
                    this.dispatchEvent('invalid', errors, options);
                    record.dispatchEvent('invalid', errors, options);
                    return false;
                } else {
                    record.dispatchEvent('invalid', response)
                    this.dispatchEvent('invalid', response)
                }
            }
        
            options.error = (response) => {
                record.dispatchEvent('error', response)
                this.dispatchEvent('error', response)
            }
            
            options.success = async response => {
                if (this.loaded) await this.add(record)
            }
            
            return this.sendResourceRequest(record, options)
        } else {
            options = record.optionsForSync('save', options);
            const path = this.connection.path(this.owner, this.reflection.name);
            return this.connection.sendRequest(options.method, path, options).then(response => {
                if (response === false) {
                    throw new RecordNotSaved()
                } else {
                    return this.add(record)
                }
            })
        }
    }

    first() {
        if (this.loaded) {
            return this.target[0];
        } else {
            return this.load().then((records) => records[0]);
        }
    }
    
    last() {
        if (this.loaded) {
            return this.target[this.target.length - 1];
        } else {
            return this.scope().last();
        }
    }

    where(...args) {
        return this.scope().where(...args);
    }
    
    order(...args) {
        return this.scope().order(...args);
    }
    
    limit(...args) {
        return this.scope().limit(...args);
    }
    toArray() {
        return this.load();
    }

    foreignKey() {
        if (this.reflection.options.foreignKey) {
            return this.reflection.options.foreignKey;
        } else if (this.reflection.options.as) {
            return this.reflection.options.as + '_id';
        } else if (this.owner.modelName) {
            return this.owner.modelName.paramKey + '_id';
        } else {
            return 'x';
        }
    }
    
    // Points a record at this association's owner. Polymorphic (`as`)
    // associations also carry the owner's type, so the record can identify
    // its owner the same way the association's scope() looks it up.
    setForeignKey(record) {
        const ownerKey = this.owner.readAttribute(this.primaryKey());
        if (ownerKey) {
            record.setAttributes({ [this.foreignKey()]: ownerKey });
        }
        if (this.reflection.options.as && this.owner.modelName) {
            record.setAttributes({ [this.foreignType()]: this.owner.modelName.name });
        }
    }

    unsetForeignKey(record) {
        record.setAttributes({ [this.foreignKey()]: null });
        if (this.reflection.options.as) {
            record.setAttributes({ [this.foreignType()]: null });
        }
    }

    foreignType () {
        if (this.reflection.options.foreignType) {
            return this.reflection.options.foreignType;
        } else if (this.reflection.options.as) {
            return this.reflection.options.as + '_type';
        } else if (this.owner.modelName) {
            return this.owner.modelName.paramKey + '_type';
        } else {
            return 'x';
        }
    }

    primaryKey() {
        if (this.reflection.options.primaryKey) {
            return this.reflection.options.primaryKey;
        } else {
            return this.owner.constructor.primaryKey;
        }
    }

    needsSaved() {
        return (this.dirty || this.target.some(r => r.needsSaved()));
    }

    setAttributes(attributes, {coerced=false, dirty=true}={}) {
        if (!coerced) {
            attributes = attributes.map((a) => {
                return  (a instanceof Record) ? a : this.reflection.model.coerceAttributes(a)
            })
        }
        
        const merged = this.mergeRecords(this.target, attributes);

        if (merged.added.length > 0) {
            merged.added = merged.added.map((r) => (r instanceof Record) ? r : this.reflection.model.instantiate(r))
            this.dispatchEvent('beforeAdd', merged.added);
        }
        if (merged.removed.length > 0) { this.dispatchEvent('beforeRemove', merged.removed); }

        let addedIndex = 0
        this.target.splice(0, this.target.length)
        merged.merged.forEach((a) => {
            if (a[0] === 'added') {
                let record = merged.added[addedIndex++]
                record.dispatchEvent('beforeAdd', this);
                
                this.target.push(record)
                this.setForeignKey(record);
                record.collections.add(this)

                record.dispatchEvent('afterAdd', this)
            } else if (a[0] == 'removed') {
                a[1].dispatchEvent('beforeRemove', this);

                this.unsetForeignKey(a[1]);
                const thisIndex = a[1].collections.delete(this);
                
                a[1].dispatchEvent('afterRemove', this)
            } else {
                a[2].setAttributesAndAssociations((a[1] instanceof Record) ? a[1].attributes : a[1], {dirty})
                if (!dirty) { a[2].persist(); }
                this.target.push(a[2])
            }
        });
        this.loaded = true;
        this.dirty = dirty;
        
        if (merged.added.length > 0) { this.dispatchEvent('afterAdd', merged.added); }
        if (merged.removed.length > 0) { this.dispatchEvent('afterRemove', merged.removed); }
    }

    scope() {
        throw new NotImplementedError(`scope() is not defined for ${this.constructor.name}`)
    }
}
