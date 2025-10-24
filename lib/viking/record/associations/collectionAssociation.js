import Association from '../association.js';
import Record from '../../record.js';
import {RecordNotSaved} from '../../errors.js';
import {isEqual, pick} from '../../support.js';

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
                    if (newRecord.primaryKey() && newRecord.primaryKey() === y.primaryKey()) {
                        return true
                    } else if (newRecord.cid === y.cid) {
                        return true
                    // } else if (y.isNewRecord()) {
                    //     return isEqual(y.attributes, pick(newRecord.attributes, Object.keys(y.attributes)))
                    } else {
                        return false;
                    }
                } else {
                    const newRecordPK = newRecord[this.reflection.model.primaryKey];
                    if (newRecordPK && newRecordPK === y.primaryKey()) {
                        return true
                    } else if (y.isNewRecord()) {
                        return isEqual(y.attributes, pick(newRecord, Object.keys(y.attributes)))
                    } else {
                        return false;
                    }
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

    setTarget(newTarget, {dirty=true, inPlaceUpdate=false}={}) {
        const merged = this.mergeRecords(this.target, newTarget);
        const setForeignKeyParams = this.owner.readAttribute(this.primaryKey()) ?
            { [this.foreignKey()]: this.owner.readAttribute(this.primaryKey()) } :
            {};
        const unsetForeignKeyParams = { [this.foreignKey()]: null }
        
        if (merged.added.length > 0) { this.dispatchEvent('beforeAdd', merged.added); }
        if (merged.removed.length > 0) { this.dispatchEvent('beforeRemove', merged.removed); }

        this.target.splice(0, this.target.length)
        merged.merged.forEach((a) => {
            if (a[0] === 'added') {
                a[1].dispatchEvent('beforeAdd', this);
                
                this.target.push(a[1])
                a[1].setAttributes(setForeignKeyParams);
                a[1].collections.add(this)
                
                a[1].dispatchEvent('afterAdd', this)
            } else if (a[0] == 'removed') {
                a[1].dispatchEvent('beforeRemove', this);
                
                a[1].setAttributes(unsetForeignKeyParams);
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
    
    map(...args) {
        let load = this.load();

        if (load instanceof Promise) {
            return load.then((records) => records.map(...args));
        } else {
            return load.map(...args);
        }
    }
    
    filter(...args) {
        let load = this.load();

        if (load instanceof Promise) {
            return load.then((records) => records.filter(...args));
        } else {
            return load.filter(...args);
        }
    }
    
    find(...args) {
        let load = this.load()
        if(load instanceof Promise) {
            return load.then(records => records.find(...args));
        } else {
            return load.find(...args);
        }
    }
    
    forEach(...args) {
        let load = this.load();

        if (load instanceof Promise) {
            return load.then((records) => records.forEach(...args));
        } else {
            return load.forEach(...args);
        }
    }
    
    length () {
        let load = this.load();

        if (load instanceof Promise) {
            return load.then((records) => records.length);
        } else {
            return load.length;
        }
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
            return this.reflection.model.connection.sendRequest(options.method, '/' + [
                this.owner.modelName.routeKey,
                this.owner.readAttribute('id'),
                this.reflection.name
            ].join("/"), options).then(response => {
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

    attributesForSave() {
        //TODO: Only send ids if targets haven't changed
        return this.target.map(record => {
            const attributes = record.attributesForSave();
            if (record.isPersisted()) {
                attributes[record.constructor.primaryKey] = record.primaryKey();
            }
            return attributes;
        });
    }
    
    setAttributes(attributes, {coerced=false, dirty=true}={}) {
        if (!coerced) {
            attributes = attributes.map((a) => {
                return  (a instanceof Record) ? a : this.reflection.model.coerceAttributes(a)
            })
        }
        
        const merged = this.mergeRecords(this.target, attributes);
        const setForeignKeyParams = this.owner.readAttribute(this.primaryKey()) ?
            { [this.foreignKey()]: this.owner.readAttribute(this.primaryKey()) } :
            {};
        const unsetForeignKeyParams = { [this.foreignKey()]: null }
        
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
                record.setAttributes(setForeignKeyParams);
                record.collections.add(this)
                
                record.dispatchEvent('afterAdd', this)
            } else if (a[0] == 'removed') {
                a[1].dispatchEvent('beforeRemove', this);
                
                a[1].setAttributes(unsetForeignKeyParams);
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
