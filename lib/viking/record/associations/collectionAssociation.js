import Association from '../association';

export function mergeRecords(oldRecords, newRecords) {
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

export default class CollectionAssociation extends Association {

    target = [];//: Model[]
    
    instantiate(attributes) {
        this.target = attributes.map((attrs) => this.reflection.model.instantiate(attrs));
        this.loaded = true;
    }

    // setTarget(target: Model[])
    setTarget(target) {
        const merged = mergeRecords(this.target, target);

        this.dispatchEvent('onadd', merged.added);
        merged.added.forEach(x => x.dispatchEvent('onadd', this));

        this.dispatchEvent('onremove', merged.removed);
        merged.removed.forEach(x => x.dispatchEvent('onremove', this));
        
        this.target = target;
        this.target.forEach((m) => {
            m.setAttributes({
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            });
        });
        this.loaded = true;
        
        if(merged.added.length > 0) {
            this.dispatchEvent('added', merged.added);
            merged.added.forEach(x => x.dispatchEvent('added', this));
        }
        if(merged.removed.length > 0) {
            this.dispatchEvent('removed', merged.removed);
            merged.removed.forEach(x => x.dispatchEvent('removed', this));
        }
    }
    
    mergeTarget(target) {
        const merged = mergeRecords(this.target, target);
        
        this.dispatchEvent('onadd', merged.added);
        merged.added.forEach(x => x.dispatchEvent('onadd', this));
        
        merged.common.forEach(([newRecord, oldRecord]) => {
            oldRecord.setAttributes(newRecord.attributes);
            oldRecord.persist();
        });
        
        this.dispatchEvent('onremove', merged.removed);
        merged.removed.forEach(x => x.dispatchEvent('onremove', this));

        this.target = merged.merged;
        this.target.forEach((m) => {
            m.setAttributes({
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            });
        });
        this.loaded = true;
        
        if(merged.added.length > 0) {
            this.dispatchEvent('added', merged.added);
            merged.added.forEach(x => x.dispatchEvent('added', this));
        }
        if(merged.removed.length > 0) {
            this.dispatchEvent('removed', merged.removed);
            merged.removed.forEach(x => x.dispatchEvent('removed', this));
        }

    }
    
    async load() {
        if (!this.loaded) {
            this.dispatchEvent('onload', this.target)
            if (this.owner.primaryKey()) {
                this.mergeTarget(await this.scope().all());
            } else {
                this.setTarget([]);
            }
            this.dispatchEvent('loaded', this.target);
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
        this.setTarget(this.target.concat([record]))
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

    // scope() {
    //     let klass = this.reflection.model;
    //     return klass.where({
    //         [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
    //     });
    // }
}
