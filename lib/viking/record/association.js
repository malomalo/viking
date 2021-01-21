import EventBus from '../eventBus.js';

/**
 * Viking Association ...
 *
 * ## Events
    |event|description|arguments|
    |-----|-----------|---------|
    |add|a record has been added|record(s)_added|
    |remove|a record has been removed|record(s)_removed|
    |load|the association has been loaded|record(s)|
    |*|any event|event_name, ...arguments|
 */

export default class Association extends EventBus {
    owner;//: Model;
    reflection;//: HasManyReflection || HasAndBelongsToManyReflection;
    target = null;//: Model | null
    loaded = false;//: boolean
    
    // constructor(owner: Model, reflection: BelongsToReflection)
    constructor(owner, reflection) {
        super(...arguments);
        this.owner = owner;
        this.reflection = reflection;
    }
    
    instantiate(attributes) {
        this.target = attributes ? this.reflection.model.instantiate(attributes) : null;
        this.loaded = true;
    }
    
    addBang(record, options={}) {
        options.method = 'POST'
        options.success = () => {
            this.add(record)
        }
        return this.sendResourceRequest(record, options);
    }
    
    removeBang(record, options={}) {
        options.method = 'DELETE'
        options.success = () => {
            this.remove(record)
        }
        return this.sendResourceRequest(record, options);
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
        if(record.readAttribute('id') == this.target.readAttribute('id')){
            this.setTarget(null)
        }
    }
}