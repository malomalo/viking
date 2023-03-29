import Association from '../association.js';
import Record from '../../record.js';
import {RecordNotSaved} from '../../errors.js';

export default class CollectionAssociation extends Association {

    target = [];//: Model[]
    
    instantiate(attributes) {
        this.target = attributes.map((attrs) => this.reflection.model.instantiate(attrs));
        this.loaded = true;
        this.dirty = false;
    }

    mergeRecords(oldRecords, newRecords) {
        const addedRecords      = [];
        const removedRecords    = oldRecords.slice(0);
        const commonRecords     = [];
        const result            = newRecords.map((x) => {
            const hasPK = x.primaryKey();
            const pkOrCid = hasPK ? hasPK : x.cid;
            const matchIndex = removedRecords.findIndex(hasPK ? (y => y.primaryKey() === pkOrCid) : (y => y.cid === pkOrCid));
    
            if (matchIndex >= 0) {
                let match = removedRecords[matchIndex];
                commonRecords.push([x, match]);
                removedRecords.splice(matchIndex, 1);
                return match;
            } else {
                addedRecords.push(x);
                return x;
            }
        });

        return {
            merged: result,
            added: addedRecords,
            common: commonRecords,
            removed: removedRecords
        };
    }

    // setTarget(target: Model[])
    setTarget(target, dirty=true) {
        const merged = this.mergeRecords(this.target, target);

        this.dispatchEvent('beforeAdd', merged.added);
        merged.added.forEach(x => x.dispatchEvent('beforeAdd', this));

        this.dispatchEvent('beforeRemove', merged.removed);
        merged.removed.forEach(x => x.dispatchEvent('beforeRemove', this));
        
        this.target = target;
        if (this.owner.readAttribute(this.primaryKey())) {
            this.target.forEach((m) => {
                m.setAttributes({
                    [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
                });
            });
        }
        this.loaded = true;
        this.dirty = dirty;
        
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
    mergeTarget(target, dirty=true) {
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
        if (this.owner.readAttribute(this.primaryKey())) {
            this.target.forEach((m) => {
                m.setAttributes({
                    [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
                });
            });
        }
        this.loaded = true;
        this.dirty = dirty;
        
        if (merged.added.length > 0) {
            this.dispatchEvent('afterAdd', merged.added);
            merged.added.forEach(x => x.dispatchEvent('afterAdd', this));
        }
        if (merged.removed.length > 0) {
            this.dispatchEvent('afterRemove', merged.removed);
            merged.removed.forEach(x => x.dispatchEvent('afterRemove', this));
        }
    }
    
    async load() {
        if (this.loaded) {
            return this.target;
        }
        
        if (this.loading) {
            await this.loading;
            return this.target;
        }
        
        this.dispatchEvent('beforeLoad', this.target);

        if (this.owner.primaryKey()) {
            this.loading = this.scope().all().then((records) => {
                this.loading = null;
                this.mergeTarget(records, false);
                this.dispatchEvent('afterLoad', this.target);
            });
        
            await this.loading;
            return this.target;
        } else {
            this.setTarget([], false);
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
    
    setAttributes(attributes, dirty) {
        // TODO detemine if primaryKey can be used in this mapping.
        this.target = attributes.map(attrs => {
            let record = this.target.shift();
            
            if (attrs instanceof Record) {
                record = attrs
            } else if (record) {
                record.setAttributesAndAssociations(attrs, dirty);
                record.persist();
            } else {
                record = this.reflection.model.instantiate(attrs);
            }

            return record;
        });
        this.loaded = true;
        this.dirty = dirty;
    }

    // scope() {
    //     let klass = this.reflection.model;
    //     return klass.where({
    //         [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
    //     });
    // }
}
