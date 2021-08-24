import Association from '../association';

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
    setTarget(target) {
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
        if (this.owner.readAttribute(this.primaryKey())) {
            this.target.forEach((m) => {
                m.setAttributes({
                    [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
                });
            });
        }
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
    
    async load() {
        if (!this.loaded) {
            this.dispatchEvent('beforeLoad', this.target)
            if (this.owner.primaryKey()) {
                this.mergeTarget(await this.scope().all());
            } else {
                this.setTarget([]);
            }
            this.dirty = false;
            this.dispatchEvent('afterLoad', this.target);
        }
        
        return this.target;
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

    push (record) {
        if (!this.target.find(x => x.cid == record.cid)){
            this.setTarget(this.target.concat([record]))
        }
    }
    
    add (record, options) {
        this.push(record)
    }
    
    async remove (record, options) {
        this.setTarget(await this.filter(x => x != record))
    }
    
    addBang(record, options={}) {
        options.method = 'POST'
        return this.sendResourceRequest(record, options).then(() => {
            if(this.loaded) this.add(record)
        });
    }
    
    first() {
        if (this.loaded) {
            return this.target[0];
        } else {
            return this.scope().first();
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
    
    first() {
        if (this.loaded) {
            return this.target[0];
        } else {
            return this.load().then((records) => records[0]);
        }
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
    
    setAttributes(attributes) {
        // TODO detemine if primaryKey can be used in this mapping.
        this.target = attributes.map(attrs => {
            let record = this.target.shift();
            if (record) {
                record.setAttributes(attrs);
                record.persist();
            } else {
                record = this.reflection.model.instantiate(attrs);
            }

            return record;
        });
        this.loaded = true;
        this.drity = false;
    }

    // scope() {
    //     let klass = this.reflection.model;
    //     return klass.where({
    //         [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
    //     });
    // }
}
