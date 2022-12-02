import EventBus from '../eventBus.js';
import {RecordNotSaved} from '../errors';

/**
 * Viking Association ...
 *
 * ## Events
    |event|description|arguments|
    |-----|-----------|---------|
    |beforeAdd|a record is about to be added|record(s)_added|
    |afterAdd|a record has been added|record(s)_added|
    |beforeRemove|a record is about to be removed|record(s)_removed|
    |afterRemove|a record has been removed|record(s)_removed|
    |beforeLoad|the association is about to load|record(s)|
    |afterLoad|the association has been loaded|record(s)|
    |*|any event|event_name, ...arguments|
 */

export default class Association extends EventBus {
    owner;//: Model;
    reflection;//: HasManyReflection || HasAndBelongsToManyReflection;
    target = null;//: Model | null
    loaded = false;//: boolean
    dirty = false;
    
    // constructor(owner: Model, reflection: BelongsToReflection)
    constructor(owner, reflection) {
        super(...arguments);
        this.owner = owner;
        this.reflection = reflection;
    }
    
    clone () {
        const clone = new this.constructor(this.owner, this.reflection)
        clone.loaded = this.loaded
        if(Array.isArray(this.target)){
            clone.target = this.target.map(x => x.clone())
        } else if (this.target) {
            clone.target = this.target.clone()
        }
        return clone
    }
    
    instantiate(attributes) {
        this.target = attributes ? this.reflection.model.instantiate(attributes) : null;
        this.loaded = true;
        this.dirty = false;
    }
    
    addBang(record, options={}) {
        if (!this.owner.isPersisted()) {
            throw new RecordNotSaved("Failed to add the record because the parent is not presisted");
        }
        
        options.method = 'POST'
        if (record.isPersisted()) {
            return this.sendResourceRequest(record, options).then(() => {
                this.add(record);
            });
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
    
    removeBang(record, options={}) {
        options.method = 'DELETE'
        return this.sendResourceRequest(record, options).then(() => {
            this.remove(record)
        });
    }
    
    sendResourceRequest(record, options) {
        return this.reflection.model.connection.sendRequest(options.method, '/' + [
            this.owner.modelName.routeKey,
            this.owner.readAttribute('id'),
            this.reflection.name,
            record.readAttribute('id')
        ].join("/"), options)
    }
    
    add(record) {
       this.setTarget(record)
    }
    
    remove(record) {
        if(record.readAttribute('id') == this.target?.readAttribute('id')){
            this.setTarget(null)
        }
    }
    
    reload() {
        this.loaded = false;
        // TODO cancel active requests
        return this.load()
    }
    
    needsSaved() {
        return (this.dirty || this.target?.needsSaved())
    }
    
    setAttributes(attributes, dirty) {
        if (this.loaded && this.target) {
            if (this.dirty && dirty === false) this.dirty = false;
            this.target.setAttributesAndAssociations(attributes, dirty)
            this.target.persist()
        } else {
            this.instantiate(attributes)
        }
    }
}