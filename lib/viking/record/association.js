import EventBus from '../eventBus.js';
import {RecordNotSaved, VikingError} from '../errors.js';
import {uniqueId} from '../support.js';

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
 * |beforeAdd|Triggered before a record is added to the association|record(s)_added, details|
 * |afterAdd|Triggered after a record has been added to the association|record(s)_added, details|
 * |beforeRemove|Triggered before a record is removed from the association|record(s)_removed, details|
 * |afterRemove|Triggered after a record has been removed from the association|record(s)_removed, details|
 * |beforeLoad|Triggered before the association is loaded from the server|record(s), details|
 * |afterLoad|Triggered after the association has been loaded from the server|record(s), details|
 * |*|Any event can be listened for|event_name, ...arguments|
 *
 * `details` holds any extra option keys passed to the method that fired the
 * event (e.g. `setTarget(record, {silentNotification: true})`), or `{}`.
 *
 * @extends EventBus
 * @param {Record} owner - The parent record that owns this association
 * @param {Record.Reflection} reflection - The reflection that defines this association
 *
 */

export default class Association extends EventBus {
    constructor(owner, reflection) {
        super(...arguments);
        this.cid = uniqueId('a')
        this.owner = owner;
        this.reflection = reflection;
        this.connection = this.reflection.model.connection;
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
    
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /**
     * Returns the loaded target(s) for JSON serialization, so
     * `JSON.stringify(association)` emits the record attributes rather than
     * internal state.
     *
     * @return {Object|Object[]|null} The target record(s) attributes
     * @throws {VikingError} If the association is not loaded
     */
    toJSON() {
        if (!this.loaded) {
            throw new VikingError("Association has not been loaded. Call load() before serializing.");
        }
        if (Array.isArray(this.target)) {
            return this.target.map((record) => record.toJSON());
        }
        return this.target ? this.target.toJSON() : null;
    }

    /**
     * Loads the association if needed and returns the target(s) for JSON
     * serialization; the async counterpart of
     * [toJSON]{@linkcode Association#toJSON}.
     *
     * @return {Promise<Object|Object[]|null>} The target record(s) attributes
     */
    async asyncToJSON() {
        await this.load();
        return this.toJSON();
    }

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
        
        options.label = `${this.owner.modelName.name}[${this.owner.cid}].${this.reflection.name}[${this.cid}] addBang`
        const details = record.requestDetails(options);

        options.method = 'POST'
        if (record.isPersisted()) {
            return this.sendResourceRequest(record, options).then(() => {
                this.add(record, details);
            });
        } else {
            options = record.optionsForSync('save', options);
            const path = this.connection.path(this.owner, this.reflection.name);
            return this.connection.sendRequest(options.method, path, options).then(response => {
                if (response === false) {
                    throw new RecordNotSaved()
                } else {
                    return this.add(record, details)
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
        options.label = `${this.owner.modelName.name}[${this.owner.cid}].${this.reflection.name}[${this.cid}] removeBang`
        const details = record.requestDetails(options);

        return this.sendResourceRequest(record, options).then(() => {
            this.remove(record, details)
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
        const path = this.connection.path(this.owner, this.reflection.name, record);
        return this.connection.sendRequest(options.method, path, options)
    }
    
    /**
     * Adds a record to the association
     * 
     * @param {Record} record - The record to add to the association
     * @param {Object} [details={}] - Details passed to the dispatched events
     */
    add(record, {...details}={}) {
       this.setTarget(record, details)
    }

    /**
     * Removes a record from the association
     *
     * @param {Record} record - The record to remove from the association
     * @param {Object} [details={}] - Details passed to the dispatched events
     */
    remove(record, {...details}={}) {
        if(record.readAttribute('id') == this.target?.readAttribute('id')){
            this.setTarget(null, details)
        }
    }

    /**
     * Reloads the association from the server
     *
     * @param {Object} [details={}] - Details passed to the dispatched events
     * @return {Promise} A promise that resolves with the reloaded association
     */
    reload({...details}={}) {
        // TODO cancel active requests
        this.loaded = false;

        return this.load(details)
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
     * @param {...*} details - Any other keys are passed through as `details`
     *   to the target's change events
     */
    setAttributes(attributes, {dirty=true, ...details}={}) {
        if (this.loaded && this.target) {
            if (this.dirty && dirty === false) this.dirty = false;
            this.target.setAttributes(attributes, {dirty, ...details})
            this.target.persist()
        } else {
            this.instantiate(attributes)
        }
    }
}