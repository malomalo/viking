import * as Errors from './errors.js';
import Model from './model.js';
import {each, isEqual, deepAssign, isFunction, pick, scanPrototypesFor} from './support.js';
import {isPlainObject} from './support/object.js';
import Relation from './record/relation.js';

/**
 * A model class for handling data persistence and relationships. Record provides ActiveRecord-like
 * functionality including a rich API for querying, persistence, attribute changes tracking,
 * validations, and associations.
 * 
 * The in-memory attribute layer — schema-typed accessors, type coercion, default
 * values, change tracking, and model naming (including single-table inheritance)
 * — is provided by its {@link Model} superclass. Record adds:
 * - Relationship management (hasOne, hasMany, belongsTo, etc.)
 * - RESTful API integration and persistence (save, reload, destroy)
 * - Querying via {@link Relation} (all, where, find, etc.)
 * - Event system for lifecycle hooks
 *
 * This is an extension of the original Backbone.Model concept, adding enhanced
 * functionality to work seamlessly with Ruby on Rails backends and modern JavaScript applications.
 *
 * @extends Model
 */
export default class Record extends Model {

    static connection = null; // : AbstractConnection | null = null;
    static associations = [];//: (typeof Reflection)[] = [];

    static abstract = true//: boolean = true;
    static primaryKey = 'id'//: string = 'id';

    static path;//: undefined | string;
    
    static beforeSave = [];
    static beforeCreate = [];
    static beforeDestroy = [];
    static afterSave = [];
    static afterCreate = [];
    static afterDestroy = [];
    
    /**
     * Initializes associations for this model type
     */
    static initializeAssociations() {
        if (!this.hasOwnProperty('_associations')) {
            this._associations = {};
            
            scanPrototypesFor(this, 'associations').filter(x => x).reverse().forEach(associations => {
                if (isFunction(associations)) {
                    associations = associations()
                }
                associations.forEach(association => {
                    association = new association.reflection(...association.args);
                    this._associations[association.name] = association;
                })
            })
        }
    }
    
    /**
     * Gets the reflection object for a specific association
     * @param {string} name - The name of the association
     * @returns {Association}
     */
    static reflectOnAssociation(name) {
        this.initializeAssociations();
        return this._associations[name];
    }
    
    /**
     * Gets all reflection objects for this model's associations
     * @returns {Array<Association>}
     */
    static reflectOnAllAssociations() {
        this.initializeAssociations();
        return Object.values(this._associations);
    }

    /**
     * Creates a relation for querying all records of this type
     * @returns {Relation} A relation for querying all records
     */
    static all() {
        return new Relation(this);
    }

    /**
     * Creates a relation for querying records with a limit
     * @param {number} number - The maximum number of records to return
     * @returns {Relation} A relation with the specified limit
     */
    static limit(number) {
        return new Relation(this).limit(number);
    }
    
    /**
     * Creates a relation for querying records with specific criteria
     * @param {Object} query - The query criteria for filtering records
     * @returns {Relation} A relation with the specified criteria
     */
    static where(query) {
        return new Relation(this).where(query);
    }
    
    /**
     * Creates a relation for grouping records by specified attributes
     * @param {...string} args - The attributes to group by
     * @returns {Relation} A relation with the specified grouping
     */
    static groupBy(...args) {
        return new Relation(this).groupBy(...args);
    }
    
    /**
     * Creates a relation that calculates the sum of the specified attribute
     * @param {...string} args - The attributes to sum
     * @returns {Relation} A relation with the sum calculation
     */
    static sum(...args) {
        return new Relation(this).sum(...args);
    }
    
    /**
     * Creates a relation that counts records matching the criteria
     * @param {...string} args - Optional attributes to count by
     * @returns {Relation} A relation with the count operation
     */
    static count(...args) {
        return new Relation(this).count(...args);
    }
    
    /**
     * Instantiate a new instance of the appropriate class.
     *
     * For example, `Post.all()` may return Comments, Messages, and Emails
     * by storing the record's subclass in a +type+ attribute. By calling
     * `instantiate` instead of `new`, finder methods ensure they get new
     * instances of the appropriate class for each record.
     *
     * See `ActiveRecord::Inheritance#discriminate_class_for_record` to see
     * how this "single-table" inheritance mapping is implemented.
     * 
     * @param {Object} attributes - The attributes for the new record
     * @returns {Record} A new record with the given attributes
     */
    static instantiate(attributes) {
        let record = new this();
        record.setAttributesAndAssociations(attributes, {dirty: false})
        record.persist()
        return record;
    }

    // Find a record by id. Accepts success and error callbacks in the options
    // hash, which are both passed (model, response, options) as arguments.
    //
    // Find returns the model, however it most likely won't have fetched the
    // data	from the server if you immediately try to use attributes of the
    // model.
    /**
     * Find a record by its primary key
     * @param {*} id - The primary key to search for
     * @returns {Promise<Record>} Promise that resolves with the found record
     * @async
     */
    static async find(id) {
        return this.where({ [this.primaryKey]: id }).first();
    }

    /**
     * Gets the first record of this model from the database
     * @returns {Promise<Record>} Promise that resolves with the first record
     * @async
     */
    static async first() {
        return this.all().first();
    }

    /**
     * Gets the last record of this model from the database
     * @returns {Promise<Record>} Promise that resolves with the last record
     * @async
     */
    static async last() {
        return this.all().last();
    }

    /**
     * Iterates over all records of this model from the database
     * @param {Function} callback - Function to call for each record
     * @returns {Promise<Array>} Promise that resolves with the results of the callback
     * @async
     */
    static async forEach(callback) {
        return this.all().forEach(callback);
    }
    
    /**
     * Eager-loads specified associations with records of this model
     * @param {...string} args - The associations to eager load
     * @returns {Relation} A relation with the eager load operation
     */
    static eagerLoad(...args) {
        return this.all().eagerLoad(...args);
    }
    
    /**
     * Gets a limited number of records of this model from the database
     * @param {number} limit - The maximum number of records to return
     * @returns {Relation} A relation with the limit operation
     */
    static limit(limit) {
        return this.all().limit(limit);
    }

    /**
     * Creates and saves a new record with the given attributes
     * @param {Object} attributes - Attributes for the new model
     * @param {SaveOptions} [options={}] - Options for saving
     * @returns {Promise<Record>} Promise that resolves with the created model
     * @async
     */
    static async create(attributes, options = {}) {
      var model = new this(attributes);
      await model.save(options);
      return model;
    }

    /**
     * Creates and saves a new record, throwing an error if it fails
     * @param {Object} attributes - Attributes for the new model
     * @param {SaveOptions} [options={}] - Options for saving
     * @returns {Promise<Record>} Promise that resolves with the created model
     * @throws {Errors.RecordNotSaved} If the save operation fails
     * @async
     */
    static async create$(attributes, options = {}) {
      var model = new this(attributes);
      await model.save$(options);
      return model;
    }

    // Instance state used by Record is set up in `declareProperties` (below)
    // rather than as class fields. Field initializers run only after `super()`
    // returns — i.e. after Model's constructor has already invoked
    // `declareProperties` and applied attributes — so declaring these as fields
    // would reset them and wipe the attached associations.

    // constructor(attributes?: IModelAttributes, options?: IModelOptions)
    constructor(attributes={}, options={}) {
        super(attributes, options);

        // Model computes modelName/baseClass for any class that isn't Model itself;
        // Record is the abstract base users extend, so a bare Record instance has none.
        if (this.constructor === Record) {
            this.modelName = undefined;
            this.baseClass = undefined;
        }

        [
            'beforeSave',
            'beforeCreate',
            'beforeDestroy',
            'afterSave',
            'afterCreate',
            'afterDestroy'
        ].forEach(event => {
            this.constructor[event].forEach(callback => {
                if (!isFunction(callback)) {
                    callback = this[callback]
                }
                this.addEventListener(event, callback)
            })
        })
    }

    /**
     * Sets up Record-specific state (persistence flags, associations) before
     * attributes are applied. Overrides {@link Model#declareProperties}.
     * Associations are attached here so `setAttributes` can resolve association
     * keys and `dispatchChange` can reach the record's collections.
     */
    declareProperties() {
        this.collections = new Set;
        this._saving = null;//: Promise<XHR>
        this._new_record = true;//: boolean
        this._destroyed = false;
        this._associations = {};     //: { [propName: string]: any; }
        this.errors = {};

        this.constructor.reflectOnAllAssociations().forEach((association) => {
            this._associations[association.name] = association.attachTo(this);
        });
    }

    /**
     * Returns string to use for params names. This is the key attributes from
     * the model will be namespaced under when saving to the server
     * @returns {string|undefined} The parameter root key name
     */
    paramRoot() {
        if (this.baseClass) {
            return this.baseClass.modelName().paramKey;
        }
    }

    /**
     * Determines if the record has been persisted to the database
     * @returns {boolean} True if the record is persisted
     */
    isPersisted() {
        return !(this._new_record || this._destroyed);
    }

    /**
     * Marks the record as persisted (not new) and clears change tracking
     * @returns {Record} This record instance for chaining
     */
    persist() {
        this._new_record = false;
        this._changes = {};
        return this;
    }

    /**
     * Checks if this record is new (not yet persisted to the database)
     * @returns {boolean} True if the record is new
     */
    isNewRecord() {
        return this._new_record;
    }
    
    /**
     * Checks if this record has been destroyed
     * @returns {boolean} True if the record has been destroyed
     */
    destroyed() {
        return this._destroyed
    }

    /**
     * Creates a clone of this record
     * @returns {Record} A new instance with the same attributes and state
     */
    clone() {
        const clone = super.clone()
        clone._new_record = this._new_record
        clone._destroyed = this._destroyed
        return clone;
    }

    /**
     * Checks if this record needs to be saved
     * @returns {boolean} True if the record is new, has changes, or has associations that need saving
     */
    needsSaved() {
        return this.isNewRecord() ||
            this.hasChanged() ||
            Object.values(this._associations).some(a => a.needsSaved());
    }
    
    /**
     * Dispatches the record-level change event, then notifies each collection
     * containing this record. Overrides {@link Model#dispatchChange}.
     * @param {Object} changes - The changes made, with [oldValue, newValue] pairs
     * @fires Record#changed
     * @fires Relation#record:changed
     */
    dispatchChange(changes) {
        super.dispatchChange(changes);

        /**
         * Fired on each collection containing this record when the
         * record's attributes change.
         * @event Relation#record:changed
         * @param {Record} record - The record that was changed
         * @param {Object} changes - The changes made, with [oldValue, newValue] pairs
         */
        this.collections.forEach(c => c.dispatchEvent('record:changed', this, changes));
    }

    /**
     * Dispatches the change event for a single attribute, then notifies each
     * collection containing this record. Overrides {@link Model#dispatchAttributeChange}.
     * @param {string} key - The attribute that changed
     * @param {*} oldValue - The previous value of the attribute
     * @param {*} newValue - The new value of the attribute
     * @fires Record#changed:{attribute}
     * @fires Relation#record:changed:{attribute}
     */
    dispatchAttributeChange(key, oldValue, newValue) {
        super.dispatchAttributeChange(key, oldValue, newValue);

        /**
         * Fired on each collection containing this record when a
         * specific attribute on the record is changed.
         * @event Relation#record:changed:{attribute}
         * @param {Record} record - The record that was changed
         * @param {*} oldValue - The previous value of the attribute
         * @param {*} newValue - The new value of the attribute
         */
        this.collections.forEach(c => c.dispatchEvent('record:changed:' + key, this, oldValue, newValue));
    }

    /**
     * Overrides {@link Model#setAttributes} so that setting attributes — at
     * construction and everywhere else — routes association keys to their
     * associations. Delegates to {@link Record#setAttributesAndAssociations},
     * which holds the routing logic.
     * @param {Object} attributes - Object containing attributes and associations to set
     * @param {Object} [options={}]
     * @param {boolean} [options.coerced=false] - Whether the attributes have already been coerced
     * @param {boolean} [options.dirty=true] - Whether to mark changes as dirty
     * @returns {Object} The attribute changes
     */
    setAttributes(attributes, options = {}) {
        return this.setAttributesAndAssociations(attributes, options);
    }

    /**
     * Sets both attributes and associations at once: association keys are routed
     * to their associations and the remaining plain attributes are applied via
     * {@link Model#setAttributes} (called as `super` to avoid recursing back
     * through {@link Record#setAttributes}).
     * @param {Object} attributes - Object containing attributes and associations to set
     * @param {Object} [options={}]
     * @param {boolean} [options.coerced=false] - Whether the attributes have already been coerced
     * @param {boolean} [options.dirty=true] - Whether to mark changes as dirty
     * @returns {Object} The attribute changes
     */
    setAttributesAndAssociations(attributes, options = {}) {
        const {dirty = true} = options;
        each(attributes, (key, value) => {
            if (this._associations.hasOwnProperty(key)) {
                const association = this.association(key);
                if (association.reflection.options.polymorphic) {
                    super.setAttributes(pick(attributes, association.reflection.foreignType()))
                }
                if (value instanceof Record) {
                    association.setTarget(value, {dirty});
                } else {
                    association.setAttributes(value, {dirty});
                }
                delete attributes[key];
            }
        });

        return super.setAttributes(attributes, options);
    }


    /**
     * The connection adapter for this record's class
     * @returns {AbstractConnection|null} The connection, or null if none is established
     */
    get connection() {
        return this.constructor.connection;
    }

    /**
     * Gets the primary key value for this record
     * @returns {*} The primary key value
     */
    primaryKey() {
        return this.readAttribute(this.constructor.primaryKey);
    }

    /**
     * Returns a string representing the object's key suitable for use in URLs
     * @returns {string} The key for use in URLs
     */
    toParam() {
        return this.readAttribute(this.constructor.primaryKey);
    }

    /**
     * Saves the record and throws an error if it fails
     * @param {...*} args - Arguments to pass to save
     * @returns {Promise<void>}
     * @throws {Errors.RecordNotSaved} If the save operation fails
     * @async
     */
    async save$(...args) {
        let saved = await this.save(...args);
        
        if (!saved) {
            throw new Errors.RecordNotSaved("Failed to save the record");
        }
    }
    
    /**
     * Options for syncing a record with the server
     * @typedef {Object} SyncOptions
     * @property {Object} [body] - Custom request body
     * @property {Function} [success] - Success callback
     * @property {Function} [error] - Error callback
     * @property {Function} [invalid] - Invalid callback for validation errors
     */
    
    /**
     * Prepares options for syncing with the server
     * @param {string} event - The event type (e.g., 'save', 'destroy')
     * @param {SyncOptions} [options={}] - Additional options
     * @returns {SyncOptions} Modified options with success and error handlers
     * @fires beforeCreate - Before a new record is created, see {@link Record#event:beforeCreate}
     * @fires beforeSave - Before a record is saved, see {@link Record#event:beforeSave}
     * @fires beforeSync - Before a record is synced with the server, see {@link Record#event:beforeSync}
     * @fires afterCreate - After a record is created, see {@link Record#event:afterCreate}
     * @fires afterSave - After a record is saved, see {@link Record#event:afterSave}
     * @fires afterSync - After a record is synced with the server, see {@link Record#event:afterSync}
     * @fires afterSync:{attribute} - After a specific attribute is synced, see {@link Record#event:afterSync:{attribute}}
     * @fires invalid - When validation fails, see {@link Record#event:invalid}
     * @fires error - When a server error occurs, see {@link Record#event:error}
     */
    optionsForSync(event, options={}, attributes=null) {

        const wasNew = this.isNewRecord();
        let changes = this.changes();

        // Snapshot the values being sent now. `changes()` hands back the live
        // _changes object, so a later edit (e.g. a queued save) mutates it in
        // place; the success handler needs the values as of this request to
        // tell a server response apart from an edit made after we sent.
        const sentAttributes = {};
        each(changes, (key, value) => { sentAttributes[key] = value[1]; });

        if (event == 'save') {
            if (wasNew) {
                /**
                 * Fired before a new record is created
                 * @event Record#beforeCreate
                 * @param {Object} changes - The attributes that will be saved
                 * @param {Object} options - Options for the save operation
                 */
                this.dispatchEvent('beforeCreate', changes, options);
            }
            /**
             * Fired before a record is saved
             * @event Record#beforeSave
             * @param {Object} changes - The attributes that will be saved
             * @param {Object} options - Options for the save operation
             */
            this.dispatchEvent('beforeSave', changes, options);
        }
        /**
         * Fired before a record is synced with the server
         * @event Record#beforeSync
         * @param {Object} options - Options for the sync operation
         */
        this.dispatchEvent('beforeSync', options);
        
        if (event == 'save') {
            if (options.body && isPlainObject(options.body)) {
                options.body = deepAssign(this.connection.buildRequestBody(this), options.body);
            } else if (!options.body) {
                options.body = this.connection.buildRequestBody(this);
            }
        } else if (event == 'updateAttributes') {
            options.body = this.connection.buildRequestBody(this, this.connection.dumpAttributes(this, attributes));
        }
        
        options.success = (response) => {
            this.errors = {};
            if( event === 'updateAttributes' ) {
                const unsavedChanges = {};
                each(changes, (changedAttribute, value) => {
                    if ((changedAttribute in response) && !isEqual(value[1], response[changedAttribute])) {
                        unsavedChanges[changedAttribute] = [response[changedAttribute], value[1]];
                        delete response[changedAttribute]
                    }
                })
                changes = this.setAttributesAndAssociations(response, {dirty: false});
                this._changes = unsavedChanges;
            } else {
                // Preserve edits made after this save's request body was built
                // — e.g. a queued save that changed an attribute again while
                // this one was in flight. Apply the server's values as the new
                // baseline, but keep any attribute whose current value still
                // differs as a pending change instead of clearing everything
                // the way persist() would, so the queued save still sends it.
                const unsavedChanges = {};
                each(sentAttributes, (attribute, sentValue) => {
                    if ((attribute in response) && !isEqual(this.attributes[attribute], sentValue)) {
                        unsavedChanges[attribute] = [response[attribute], this.attributes[attribute]];
                        delete response[attribute];
                    }
                });
                // Reconcile attributes edited while this save was in flight but
                // never sent by it. Those edits are pending changes this request
                // knows nothing about, so the user's set value must survive — but
                // the response still reports the newly persisted value, which
                // becomes the change's baseline. Rebase the pending change onto
                // the server's value (or clear it if the server already matches
                // the set value), then drop the attribute from the response so
                // setAttributesAndAssociations can't clobber the local edit.
                each(this._changes, (attribute, value) => {
                    if (!(attribute in sentAttributes) && (attribute in response)) {
                        if (isEqual(response[attribute], this.attributes[attribute])) {
                            delete this._changes[attribute];
                        } else {
                            value[0] = response[attribute];
                        }
                        delete response[attribute];
                    }
                });
                changes = this.setAttributesAndAssociations(response, {dirty: false});
                this._new_record = false;
                // Clear only the attributes this request actually carried — they
                // are saved now — then fold back the ones that were re-edited
                // while it was in flight. Changes to attributes this request did
                // not send (made after its body was built) stay pending.
                each(sentAttributes, (attribute) => { delete this._changes[attribute]; });
                Object.assign(this._changes, unsavedChanges);
            }

            
            if (event == 'save') {
                if (wasNew) {
                    /**
                     * Fired after a new record has been created
                     * @event Record#afterCreate
                     * @param {Object} savedChanges - The attributes that were saved
                     * @param {Object} options - Options for the save operation
                     */
                    this.dispatchEvent('afterCreate', changes, options);
                }
                /**
                 * Fired after a record has been successfully saved
                 * @event Record#afterSave
                 * @param {Object} savedChanges - The attributes that were saved
                 * @param {Object} options - Options for the save operation
                 */
                this.dispatchEvent('afterSave', changes, options);
            }
            /**
             * Fired after a record has been synced with the server
             * @event Record#afterSync
             * @param {Object} savedChanges - The changes that were synced
             * @param {Object} options - Options for the sync operation
             */
            this.dispatchEvent('afterSync', changes, options);

            /**
             * Fired on each collection containing this record after the record
             * has been synced with the server.
             * @event Relation#record:afterSync
             * @param {Record} record - The record that was synced
             * @param {Object} savedChanges - The changes that were synced
             */
            this.collections.forEach(c => c.dispatchEvent('record:afterSync', this, changes));

            each(changes, (key, value) => {
                /**
                 * Fired after a specific attribute has been synced with the server
                 * @event Record#afterSync:{attribute}
                 * @param {*} oldValue - The previous value of the attribute
                 * @param {*} newValue - The new value of the attribute
                 */
                this.dispatchEvent('afterSync:'+key, value[0], value[1]);

                /**
                 * Fired on each collection containing this record after a
                 * specific attribute on the record has been synced.
                 * @event Relation#record:afterSync:{attribute}
                 * @param {Record} record - The record that was synced
                 * @param {*} oldValue - The previous value of the attribute
                 * @param {*} newValue - The new value of the attribute
                 */
                this.collections.forEach(c => c.dispatchEvent('record:afterSync:' + key, this, value[0], value[1]));
            });

            return true;
        }

        options.invalid = (request, error_callback) => {
            const errors = this.connection.parseErrors(request.responseText, request.getResponseHeader('Content-Type'));

            if (errors) {
                this.errors = errors;
                /**
                 * Fired when a record has failed to save because it is invalid
                 * @event Record#invalid
                 * @param {Object} errors - The validation errors
                 * @param {Object} options - Options for the operation
                 */
                this.dispatchEvent('invalid', this.errors, options);
                return false;
            } else {
                /**
                 * Fired when a record has failed to save because it is invalid
                 * @event Record#invalid
                 * @param {string} response - The server response
                 */
                this.dispatchEvent('invalid', request.responseText)
            }
        }
        
        options.error = (response) => {
            /**
             * Fired when there's a server error
             * @event Record#error
             * @param {Object} response - The error response from the server
             */
            this.dispatchEvent('error', response)
        }
        
        return options;
    }
    
    updateAttributes(attributes, options={}) {
        if (this.isNewRecord()) {
            throw new Errors.RecordError("cannot update a new record");
        }
        if (this.destroyed()) {
            throw new Errors.RecordError("cannot update a destroyed record");
        }
        // _raise_readonly_record_error if readonly?
        
        return this.commit(() => this.optionsForSync('updateAttributes', options, attributes))
    }
    
    update(attributes, options={}) {
        this.setAttributes(attributes);
        return this.save(options);
    }
    
    async update$(...args) {
        const success = await this.update(...args)
        if (!success) {
            throw new Errors.RecordNotSaved("Failed to save the record");
        }
    }
    
    /**
     * Options for saving a record
     * @typedef {Object} SaveOptions
     * @property {Object} [body] - Custom request body to merge with the record attributes
     * @property {Function} [success] - Success callback
     * @property {Function} [error] - Error callback
     * @property {Function} [invalid] - Invalid callback for validation errors
     */
    
    /**
     * Saves the record to the server. If a save request has already been made they will be chained.
     * @param {SaveOptions} [options={}] - Options for saving
     * @returns {Promise} Promise that resolves when save is complete
     * @throws {Errors.ConnectionNotEstablished} If no connection is established
     * @fires beforeCreate - Before a new record is created, see {@link Record#event:beforeCreate}
     * @fires beforeSave - Before a record is saved, see {@link Record#event:beforeSave}
     * @fires beforeSync - Before a record is synced with the server, see {@link Record#event:beforeSync}
     * @fires afterCreate - After a record is created, see {@link Record#event:afterCreate}
     * @fires afterSave - After a record is saved, see {@link Record#event:afterSave}
     * @fires afterSync - After a record is synced with the server, see {@link Record#event:afterSync}
     * @fires afterSync:{attribute} - After a specific attribute is synced, see {@link Record#event:afterSync:{attribute}}
     * @fires invalid - When validation fails, see {@link Record#event:invalid}
     * @fires error - When a server error occurs, see {@link Record#event:error}
     */
    save(options = {}) {
        if (!this.needsSaved()) { return }
        return this.commit(() => {
            // Re-checked at send time: a save chained behind another may find
            // its changes already persisted by the one it waited on, in which
            // case there is nothing left to send.
            if (!this.needsSaved()) { return undefined; }
            return this.optionsForSync('save', options);
        })
    }
    
    commit (optionsBuilder) {
        if (!this.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        const sendRequest = () => {
            // Build the request at send time, not when commit() was called. A
            // chained save runs only after the preceding save's response has
            // landed — assigning the id, clearing changes, settling nested
            // records — so the body and whether this is a create vs. update
            // must be derived from that post-response state. Deriving them up
            // front made a queued save re-POST an already-created record and
            // resubmit nested children without their ids (rejected as
            // duplicates). An optionsBuilder that returns undefined means the
            // save became redundant once the preceding one persisted it.
            const options = optionsBuilder();
            if (options === undefined) { return this._saving; }

            const wasNew = this.isNewRecord();
            const action = wasNew ? 'create' : 'update';
            const path   = this.connection.path(wasNew ? this.constructor : this);

            this._savingRequest = this.connection[action](path, options)
            this._saving = this._savingRequest.finally(() => {
                this._saving = null
                this._savingRequest = null
            })
            return this._saving
        }

        // If a save request has already been made they will be chained.
        if (this._saving) {
            return this._saving.then(sendRequest)
        } else {
            return sendRequest()
        }
    }
    
    /**
     * Checks if the record is currently being saved
     * @returns {boolean} True if the record is currently being saved
     */
    isSaving() {
        return !!this._saving
    }
    
    /**
     * Options for reloading a record from the server
     * @typedef {Object} ReloadOptions
     * @property {Function} [success] - Success callback
     * @property {Function} [error] - Error callback
     */
    
    /**
     * Reloads the record from the server
     * @param {ReloadOptions} [options={}] - Options for reloading
     * @returns {Promise} Promise that resolves with the reloaded record
     * @throws {Errors.ConnectionNotEstablished} If no connection is established
     * @async
     */
    async reload(options = {}) {
        if (!this.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        if (this.isNewRecord()) { return }

        options.label = `${this.modelName.name}[${this.cid}] Reload`
        return await this.connection.read(this.connection.path(this), this.optionsForSync('reload', options));
    }
    
    /**
     * Options for destroying a record
     * @typedef {Object} DestroyOptions
     * @property {Function} [success] - Success callback
     * @property {Function} [error] - Error callback
     */
    
    /**
     * Destroys the record on the server
     * @param {DestroyOptions} [options={}] - Options for destroying
     * @returns {Promise} Promise that resolves when the record is destroyed
     * @throws {Errors.ConnectionNotEstablished} If no connection is established
     * @async
     * @fires beforeDestroy - Before the record is destroyed, see {@link Record#event:beforeDestroy}
     * @fires afterDestroy - After the record is destroyed, see {@link Record#event:afterDestroy}
     */
    async destroy(options = {}) {
        if (!this.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        if (this.isNewRecord() || this.destroyed()) {
            // TODO: ... raise error
        }

        options.label = `${this.modelName.name}[${this.cid}] Destroy`

        /**
         * Fired before a record is destroyed
         * @event Record#beforeDestroy
         * @param {Record} record - The record being destroyed
         * @param {Object} options - Options for the destroy operation
         */
        this.dispatchEvent('beforeDestroy', this, options)
        await this.connection.destroy(this.connection.path(this)).then(() => {
            /**
             * Fired after a record has been successfully destroyed
             * @event Record#afterDestroy
             * @param {Record} record - The record that was destroyed
             * @param {Object} options - Options for the destroy operation
             */
            this.dispatchEvent('afterDestroy', this, options)
        });
        this._destroyed = true;
    }
    
    /**
     * Checks if there are errors on a specific attribute
     * @param {string} attribute - The attribute to check for errors
     * @returns {boolean} True if the attribute has errors
     */
    errorsOn(attribute) {
        return !!this.errors[attribute];
    }
    
    /**
     * Gets the association object for a given association name
     * @param {string} name - The name of the association
     * @returns {Object} The association object
     */
    association(name) {
        return this._associations[name]
    }

    /**
     * Gets all association objects for this record
     * @returns {Array<Object>} The association objects
     */
    associations() {
        return Object.values(this._associations);
    }
}