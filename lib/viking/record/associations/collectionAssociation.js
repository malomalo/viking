export default class CollectionAssociation {

    owner;//: Model;
    reflection;//: HasManyReflection || HasAndBelongsToManyReflection;
    target = [];//: Model[]
    loaded = false;//: boolean

    // constructor(owner: Model, reflection: HasManyReflection || HasAndBelongsToManyReflection)
    constructor(owner, reflection) {
        this.owner = owner;
        this.reflection = reflection;
    }
    
    instantiate(attributes) {
        this.target = attributes.map((attrs) => this.reflection.model.instantiate(attrs));
        this.loaded = true;
    }

    // setTarget(target: Model[])
    setTarget(target) {
        this.target = target;

        this.target.forEach((m) => {
            m.setAttributes({
                [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
            });
        });

        this.loaded = true;
    }
    
    load() {
        if (!this.loaded) {
            if (this.owner.primaryKey()) {
                return this.scope().all().then((records) => {
                    this.target = records;
                    this.loaded = true;
                    
                    return records;
                });
            } else {
                this.target = [];
                this.loaded = true;
            }
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
    
    forEach(...args) {
        let load = this.load();

        if (load instanceof Promise) {
            return load.then((records) => records.forEach(...args));
        } else {
            return load.forEach(...args);
        }
    }

    where(...args) {
        return this.scope().where(...args);
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