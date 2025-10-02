import * as Errors from './errors';
import EventBus from './eventBus';
import {each, result, uniqueId, isEqual, deepAssign, isFunction, pick, scanPrototypesFor} from './support';
import {isPlainObject} from './support/object';
import { Name } from './record/name';
import Types from './record/types';
import Relation from './record/relation';
import * as string from './support/string';

/**
 * A model class for handling data persistence and relationships. Record provides ActiveRecord-like
 * functionality including a rich API for querying, persistence, attribute changes tracking,
 * validations, and associations.
 * 
 * It includes support for:
 * - Type coercion through attribute schema definitions
 * - Relationship management (hasOne, hasMany, belongsTo, etc.)
 * - Change tracking and dirty checking
 * - RESTful API integration
 * - Event system for lifecycle hooks
 * - Single-table inheritance
 * 
 * This is an extension of the original Backbone.Model concept, adding enhanced
 * functionality to work seamlessly with Ruby on Rails backends and modern JavaScript applications.
 * 
 * @extends EventBus
 */
export default class Record extends EventBus {

    static connection = null; // : Connection | null = null;
    static namespace = null;
    static associations = [];//: (typeof Reflection)[] = [];
    static descendants = [];

    static abstract = true//: boolean = true;
    static primaryKey = 'id'//: string = 'id';
    static schema; //: IModelSchema;
    static cidPrefix = 'm';//: string = 'm';

    // inheritanceAttribute is the attirbutes used for STI
    static inheritanceAttribute = 'type';//: string | boolean = 'type';

    static _modelName;//: Name | undefined;

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
     * Gets the inheritance attribute for this model
     * @returns {string|boolean} The inheritance attribute or default 'type'
     */
    static getInheritanceAttribute() {
        if (this.hasOwnProperty('inheritanceAttribute')) {
            return this.inheritanceAttribute;
        } else {
            return 'type';
        }
    }

    /**
     * Gets the model name object for this model
     * @returns {Name}
     */
    static modelName() {
        if (!(this.hasOwnProperty('_modelName') && this._modelName)) {
            this._modelName = new Name(this, this.name, {
                namespace: this.namespace
            });
        }
        return this._modelName;
    }

    /**
     * Gets the base class in the inheritance hierarchy for this model
     * @returns {Class<Record>} The base class of this model
     */
    static baseClass() {
        if (
             (this.__proto__.hasOwnProperty('abstract') && this.__proto__.abstract)
             ||
             this.__proto__.getInheritanceAttribute() === false
            ) {
            return this;
        } else {
            this.__proto__.descendants.push(this);
            return this.__proto__.baseClass();
        }
    }

    /**
     * Returns the defined URL root or generates the URL root based off of the class name
     * @returns {string}
     */
    static urlRoot() {
        if (this.path) {
            return this.path;
        } else {
            return "/" + this.baseClass().modelName().routeKey;
        }
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
        record.setAttributesAndAssociations(attributes, false)
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
     * @param {...string} args - The associations to include
     * @returns {Relation} A relation with the includes operation
     */
    static includes(...args) {
        return this.all().includes(...args);
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

    cid = uniqueId(this.constructor.cidPrefix);//: string 
    inheritanceAttribute = this.constructor.getInheritanceAttribute(); //: string | boolean
    attributes = {};//: { [propName: string]: any; }
    collections = [];
    _saving = null;//: Promise<XHR>
    _new_record = true;//: boolean
    _destroyed  = false;
    _changes = {};          // : any
    _associations = {};     //: { [propName: string]: any; }
    errors = {};
    
    // Add a helper reference to get the model name from an model instance.
    modelName;  //: Name | undefined;
    baseClass;  //: any;
    
    // constructor(attributes?: IModelAttributes, options?: IModelOptions)
    constructor(attributes={}, options={}) {
        super();
        
        if (this.constructor !== Record) {
            this.modelName = this.constructor.modelName();
            this.baseClass = this.constructor.baseClass();
        } else {
            this.modelName = undefined;
            this.baseClass = undefined;
        }

        if (this.baseClass && this.modelName && this.inheritanceAttribute && this.constructor.schema && this.constructor.schema[this.inheritanceAttribute]) {
            if (this.baseClass === this.constructor && this.baseClass.descendants.length > 0) {
                attributes[this.inheritanceAttribute] = this.modelName.name;
            } else if (this.baseClass.descendants.some(c => c === this.constructor)) {
                attributes[this.inheritanceAttribute] = this.modelName.name;
            }
        }

        this.constructor.reflectOnAllAssociations().forEach((association) => {
            this._associations[association.name] = association.attachTo(this);
        });
        
        each(this.constructor.schema, (key, options) => {
            if(!Object.getPrototypeOf(this).hasOwnProperty(key)){
                Object.defineProperty(this, key, {
                    configurable: true,
                    enumerable: true,
                    get: () => { return this.readAttribute(key); },
                    set: (value) => { this.setAttributes({ [key]: value }); }
                });
            }
        });

        this._changes = {};
        
        this.setDefaultAttributes(attributes);
        this.setAttributesAndAssociations(attributes);
        
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
     * Returns the base URL for the model's records on the server
     * @returns {string} The URL root for this record type
     */
    urlRoot() {
        return result(this.constructor, 'urlRoot');
    }


    /**
     * Returns an object containing the default values for this record type
     * based on the schema definition
     * @returns {Object} Default values for this record
     */
    setDefaultAttributes(attributes) {
        let dflts = {};
        each(this.constructor.schema, (key, options) => {
            if (!Object.hasOwn(attributes, key)) {
                if (options.default) {
                    dflts[key] = result(options, 'default');
                } else {
                    this.attributes[key] = null;
                }
            }
        });

        if (Object.keys(dflts).length > 0) {
            this.setAttributes(dflts);
        }
    }

    /**
     * Get the value of an attribute
     * @param {string} attributeName - The name of the attribute to read
     * @returns {*} The attribute value
     */
    readAttribute(attributeName) {
        return this.attributes[attributeName];
    }

    /**
     * Returns true if the given attribute is in the attributes hash, otherwise false
     * @param {string} attributeName - The name of the attribute to check
     * @returns {boolean} True if the attribute exists
     */
    hasAttribute(attributeName) {
        return attributeName in this.attributes;
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
        const clone = new this.constructor(deepAssign({}, this.attributes))
        clone._new_record = this._new_record
        clone._destroyed = this._destroyed
        clone._changes = Object.assign({}, this._changes)
        return clone;
    }

    /**
     * Returns all changes made to this record since it was last persisted
     * @returns {Object} Object containing changed attributes with [oldValue, newValue] pairs
     */
    changes() {
        return this._changes;
    }
    
    /**
     * Returns names of all attributes that have changed
     * @returns {Array<string>} Array of attribute names that have changed
     */
    changedAttributes() {
        return Object.keys(this._changes);
    }

    /**
     * Checks if the record or a specific attribute has changed
     * @param {string} [attributeName] - Optional attribute name to check
     * @returns {boolean} True if the record or specified attribute has changed
     */
    hasChanged(attributeName) {
        if (attributeName) {
            return (attributeName in this._changes);
        } else {
            return (Object.keys(this._changes).length > 0);
        }
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
     * Coerces attribute values according to their type definitions in the schema
     * @param {Object} changes - Object containing attribute changes to coerce
     */
    coerceAttributes(changes) {
        const queue = [];
        const schema = this.constructor.schema;
        
        const coerceAttribute = (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                let type = schema[key].type
                if (isFunction(type)) {
                    type = type(this, changes)
                    if (type === false)
                    return queue.push([key, value]);
                }
                const Type = Types.registry[type];
                if (Type) {
                    if (Type.set(key, value, changes, this, schema[key]) === false) {
                        queue.push([key, value]);
                    }
                } else {
                    throw new TypeError("Coercion of " + schema[key].type + " unsupported");
                }
            }
        }
        each(changes, coerceAttribute);
        each(queue, coerceAttribute);
    }
    
    /**
     * Sets a single attribute value
     * @param {string} attribute - The attribute name to set
     * @param {*} value - The value to set
     * @returns {Record} This record instance for chaining
     */
    setAttribute(attribute, value) {
        return this.setAttributes({
            [attribute]: value
        })
    }
    
    /**
     * Sets multiple attribute values at once
     * @param {Object} attributes - Object containing attribute name/value pairs to set
     * @param {boolean} [coerced=false] - Whether the attributes have already been coerced
     * @returns {Record} This record instance for chaining
     * @fires changed - When attributes are changed, see {@link Record#event:changed}
     * @fires changed:{attribute} - When a specific attribute is changed, see {@link Record#event:changed:{attribute}}
     */
    setAttributes(attributes, coerced=false) {
        let changes = {};
        // let chaning = this._changing;
        // this._changing = true;

        // if (!chaning) {
        //     this._previousAttributes = _.clone(this.attributes);
        //     this.changed = {};
        // }
        // let current = this.attributes;
        // let changed = this.changed;
        // let prev = this._previousAttributes;
        if (!coerced) {
            this.coerceAttributes(attributes);
        }

        each(attributes, (key, value) => {
            if (!(key in this.attributes) || !isEqual(this.attributes[key], value)) {
                changes[key] = [this.attributes[key], value];
                
                if (this._changes[key]) {
                    if (isEqual(this._changes[key][0], value)) {
                        delete this._changes[key];
                    } else {
                        this._changes[key][1] = value;
                    }
                } else {
                    this._changes[key] = [ this.attributes[key] || null, value ];
                }
                this.attributes[key] = value;
                
                /**
                 * Fired when a specific attribute on a record is changed
                 * @event Record#changed:{attribute}
                 * @memberof Record
                 * @param {Record} record - The record that was changed
                 * @param {*} oldValue - The previous value of the attribute
                 * @param {*} newValue - The new value of the attribute
                 */
                this.dispatchEvent('changed:' + key, this, ...changes[key]);
            }
        })
        // TODO: if id not defined in schema add?
        // if (this.constructor.primaryKey in attributes) {
        //     this.id = this.readAttribute(this.constructor.primaryKey);
        // }

        // Trigger all relevant attribute changes.

        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        // if (changing) { return this; }
            // while (this._pending) {
            //     options = this._pending;
            //     this._pending = false;
                if(Object.keys(changes).length > 0) {
                    /**
                     * Fired when attributes on a record are changed
                     * @event Record#changed
                     * @param {Record} record - The record that was changed
                     * @param {Object} changes - The changes made, with [oldValue, newValue] pairs
                     */
                    this.dispatchEvent('changed', this, changes); //, options
                }
            // }

        // this._pending = false;
        // this._changing = false;
        return changes;
    }
    
    /**
     * Sets both attributes and associations at once
     * @param {Object} attributes - Object containing attributes and associations to set
     * @param {boolean} [dirty=true] - Whether to mark associations as dirty
     * @returns {Record} This record instance for chaining
     */
    setAttributesAndAssociations(attributes, dirty=true) {
        each(attributes, (key, value) => {
            if (this._associations.hasOwnProperty(key)) {
                const association = this.association(key);
                if (association.reflection.options.polymorphic) {
                    this.setAttributes(pick(attributes, association.reflection.foreignType()))
                }
                if (value instanceof Record) {
                    association.setTarget(value, dirty);
                } else {
                    association.setAttributes(value, dirty);
                }
                delete attributes[key];
            }
        });
        
        return this.setAttributes(attributes);
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
     * Default URL for the model's representation on the server
     * @returns {string} The URL for this record
     * @throws {Error} If urlRoot is not specified
     */
    url() {
        let base = result(this, 'urlRoot');

        if (!base) {
            throw new Error('A "urlRoot" property or function must be specified');
        }

        return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.toParam());
    }

    /**
     * Returns the record's attributes as a JSON-compatible object
     * @returns {Object} JSON representation of the record
     */
    asJSON() {
        return this.dumpAttributes(this.attributes);
    }

    /**
     * Converts attributes to their serialized form using type definitions
     * @param {Object} attributes - Attributes to convert
     * @returns {Object} Converted attributes
     * @throws {TypeError} If an unsupported type is encountered
     */
    dumpAttributes(attributes) {
        const dump = {};
        const schema = this.constructor.schema;
        
        each(attributes, (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                let type = schema[key].type
                if (isFunction(type)) {
                    type = type(this)
                }
                const Type = Types.registry[type]
                if (!Type) {
                    throw new TypeError("Coercion of " + schema[key].type + " unsupported");
                }
                dump[key] = Type.get(value, schema[key]);
            } else {
                dump[key] = value;
            }
        });
        
        return dump;
    }
    
    /**
     * Prepares attributes for saving to the server
     * @param {Object} [options] - Options for saving
     * @returns {Object} Attributes ready for saving
     */
    attributesForSave(options) {
        let attributes = {};
        const schema = this.constructor.schema;
        
        each(this.changedAttributes(options), (key) => {
            attributes[key] = this.attributes[key];
        });
        
        attributes = this.dumpAttributes(attributes);
        
        each(this._associations, (name, association) => {
            if (association.needsSaved()) {
                attributes[`${association.reflection.name}`] = association.attributesForSave();
            }
        });
        
        return attributes;
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
                options.body = deepAssign({ [this.paramRoot()]: this.attributesForSave() }, options.body);
            } else if (!options.body) {
                options.body = { [this.paramRoot()]: this.attributesForSave()};
            }
        } else if (event == 'updateAttributes') {
            options.body = { [this.paramRoot()]: this.dumpAttributes(attributes)};
        }
        
        options.success = (response) => {
            if( event === 'updateAttributes' ) {
                const unsavedChanges = {};
                each(changes, (changedAttribute, value) => {
                    if ((changedAttribute in response) && !isEqual(value[1], response[changedAttribute])) {
                        unsavedChanges[changedAttribute] = [response[changedAttribute], value[1]];
                        delete response[changedAttribute]
                    }
                })
                changes = this.setAttributesAndAssociations(response, false);
                this._changes = unsavedChanges;
            } else {
                this.setAttributesAndAssociations(response, false);
                this.persist();
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
            
            each(changes, (key, value) => {
                /**
                 * Fired after a specific attribute has been synced with the server
                 * @event Record#afterSync:{attribute}
                 * @param {*} oldValue - The previous value of the attribute
                 * @param {*} newValue - The new value of the attribute
                 */
                this.dispatchEvent('afterSync:'+key, value[0], value[1]);
            });
            
            return true;
        }

        options.invalid = (request, error_callback) => {
            if (request.getResponseHeader('Content-Type').startsWith('application/json')) {
                this.errors = JSON.parse(request.responseText).errors;
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
                 * @param {Object} response - The server response
                 */
                this.dispatchEvent('invalid', response)
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
        
        return this.commit(this.optionsForSync('updateAttributes', options, attributes))
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
        // TODO: should we be setting request body here, or when request is actually sent,
        // which can be after attributes of the record have changed
        return this.commit(this.optionsForSync('save', options))
    }
    
    commit (options) {
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }
        const wasNew = this.isNewRecord();
        const method = wasNew ? 'post' : 'put';
        const path   = wasNew ? result(this, 'urlRoot') : this.url();

        const sendRequest = () => {
            this._savingRequest = this.constructor.connection[method](path, options)
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
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }
        
        if (this.isNewRecord()) { return }
        
        return await this.constructor.connection.get(this.url(), this.optionsForSync('reload', options));
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
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        if (this.isNewRecord() || this.destroyed()) {
            // TODO: ... raise error
        }
        
        /**
         * Fired before a record is destroyed
         * @event Record#beforeDestroy
         * @param {Record} record - The record being destroyed
         * @param {Object} options - Options for the destroy operation
         */
        this.dispatchEvent('beforeDestroy', this, options)
        await this.constructor.connection.delete(this.url()).then(() => {
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
}