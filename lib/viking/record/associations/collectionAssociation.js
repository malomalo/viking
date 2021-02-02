import Association from '../association';

export default class CollectionAssociation extends Association {

    target = [];//: Model[]
    
    instantiate(attributes) {
        this.target = attributes.map((attrs) => this.reflection.model.instantiate(attrs));
        this.loaded = true;
    }

    // setTarget(target: Model[])
    setTarget(target) {
        const addedRecords = target.filter(x => {
            if(x.id) return !this.target.find(y => y.id == x.id)
            return !this.target.find(y => y.cid == x.cid)
        })
        const removedRecords = this.target.filter(x => {
            if(x.id) return !target.find(y => y.id == x.id)
            return !target.find(y => y.cid == x.cid)
        })
        this.target = target;

        this.target.forEach((m) => {
            m.setAttributes({
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            });
        });
        
        if(addedRecords.length > 0) {
            this.dispatchEvent('add', addedRecords)
            addedRecords.forEach(x => x.dispatchEvent('add', this))
        }
        if(removedRecords.length > 0) {
            this.dispatchEvent('remove', removedRecords)
            removedRecords.forEach(x => {
                x.setAttributes({
                    [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
                });
                x.dispatchEvent('remove', this)
            })
        }

        this.loaded = true;
    }
    
    load() {
        if (!this.loaded) {
            if (this.owner.primaryKey()) {
                return this.scope().all().then((records) => {
                    this.target = records;
                    this.loaded = true;
                    
                    this.dispatchEvent('load', records)
                    return records;
                });
            } else {
                this.target = [];
                this.loaded = true;
            }
        }
        
        this.dispatchEvent('load', this.target)
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

    where(...args) {
        return this.scope().where(...args);
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
        } else if (this.owner.modelName) {
            return this.owner.modelName.paramKey + '_id';
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