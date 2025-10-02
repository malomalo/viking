import EventBus from '../eventBus.js';
import {RecordNotSaved} from '../errors';

/**
 * Base class for all Viking record associations.
 * 
 * Associations provide a way to define relationships between models. This class serves
 * as the foundation for specific association types like BelongsTo, HasMany, HasOne, 
 * and HasAndBelongsToMany.
 *
 * ## Events
 * 
 * All associations emit the following events that can be used to react to changes:
 * 
 * |Event|Description|Arguments|
 * |-----|-----------|---------|
 * |beforeAdd|Triggered before a record is added to the association|record(s)_added|
 * |afterAdd|Triggered after a record has been added to the association|record(s)_added|
 * |beforeRemove|Triggered before a record is removed from the association|record(s)_removed|
 * |afterRemove|Triggered after a record has been removed from the association|record(s)_removed|
 * |beforeLoad|Triggered before the association is loaded from the server|record(s)|
 * |afterLoad|Triggered after the association has been loaded from the server|record(s)|
 * |*|Any event can be listened for|event_name, ...arguments|
 * 
 * @extends EventBus
 * @param {Record} owner - The parent record that owns this association
 * @param {Record.Reflection} reflection - The reflection that defines this association
 *
 */

export default class Association extends EventBus {
    constructor(owner, reflection) {
        super(...arguments);
        this.owner = owner;
        this.reflection = reflection;
    }
    
    /**
     * The owner/parent record that this association belongs to
     * @type {Record}
     */
    owner;
    
    /**
     * The reflection that defines this association
     * @type {Record.Reflection}
     */
    reflection;
    
    /**
     * The associated record(s) - can be a single model or array of models depending on association type
     * @type {Record|Record[]|null}
     */
    target = null;
    
    /**
     * Whether the association has been loaded from the server
     * @type {boolean}
     */
    loaded = false;
    
    /**
     * Whether the association has been changed since last loaded/saved
     * @type {boolean}
     */
    dirty = false;
    
    /**
     * Whether this association contains a collection of records
     * @type {boolean}
     */
    isCollection = false;
    
    /**
     * Creates a deep clone of this association
     * 
     * @return {Association} A new association instance with cloned targets
     */
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
    
    /**
     * Instantiates a new record as the target of this association
     * 
     * @param {Object|null} attributes - Attributes to initialize the new record with
     */
    instantiate(attributes) {
        this.target = attributes ? this.reflection.model.instantiate(attributes) : null;
        this.loaded = true;
        this.dirty = false;
    }
    
    /**
     * Adds the record to the association and saves that record to the server
     * 
     * @param {Record} record - The record to add to the association
     * @param {Object} [options={}] - Options to pass to the request
     * @return {Promise} A promise that resolves when the record has been added
     * @throws {RecordNotSaved} If the owner record is not persisted
     */
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
    
    /**
     * Removes the record from the association and sends delete for that record to the server
     * 
     * @param {Record} record - The record to remove from the association
     * @param {Object} [options={}] - Options to pass to the request
     * @return {Promise} A promise that resolves when the record has been removed
     */
    removeBang(record, options={}) {
        options.method = 'DELETE'
        return this.sendResourceRequest(record, options).then(() => {
            this.remove(record)
        });
    }
    
    /**
     * Sends a request to the server for the associated resource
     * 
     * @param {Record} record - The record to send the request for
     * @param {Object} options - Options to pass to the request
     * @return {Promise} A promise that resolves with the server response
     * @private
     */
    sendResourceRequest(record, options) {
        return this.reflection.model.connection.sendRequest(options.method, '/' + [
            this.owner.modelName.routeKey,
            this.owner.readAttribute('id'),
            this.reflection.name,
            record.readAttribute('id')
        ].join("/"), options)
    }
    
    /**
     * Adds a record to the association
     * 
     * @param {Record} record - The record to add to the association
     */
    add(record) {
       this.setTarget(record)
    }
    
    /**
     * Removes a record from the association
     * 
     * @param {Record} record - The record to remove from the association
     */
    remove(record) {
        if(record.readAttribute('id') == this.target?.readAttribute('id')){
            this.setTarget(null)
        }
    }
    
    /**
     * Reloads the association from the server
     * 
     * @return {Promise} A promise that resolves with the reloaded association
     */
    reload() {
        this.loaded = false;
        // TODO cancel active requests
        return this.load()
    }
    
    /**
     * Determines if this association needs to be saved
     * 
     * @return {boolean} True if the association or its target has unsaved changes
     */
    needsSaved() {
        return (this.dirty || this.target?.needsSaved())
    }
    
    /**
     * Sets attributes on the target record of this association
     * 
     * @param {Object} attributes - Attributes to set on the target
     * @param {boolean} dirty - Whether to mark the association as dirty
     */
    setAttributes(attributes, {dirty=true}={}) {
        if (this.loaded && this.target) {
            if (this.dirty && dirty === false) this.dirty = false;
            this.target.setAttributesAndAssociations(attributes, {dirty})
            this.target.persist()
        } else {
            this.instantiate(attributes)
        }
    }
}