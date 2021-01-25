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
        return this.sendResourceRequest(record, options).then(() => {
            this.add(record)
        });
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
        if(record.readAttribute('id') == this.target.readAttribute('id')){
            this.setTarget(null)
        }
    }
}