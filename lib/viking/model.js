import EventBus from './eventBus.js';
import {each, result, uniqueId, isEqual, deepAssign} from './support.js';
import Name from './model/name.js';
import Types from './model/types.js';

/**
 * An in-memory data object with typed, change-tracked attributes.
 *
 * Model provides the attribute layer shared by all data objects: schema-driven
 * getters/setters, type coercion, default values, and dirty-state tracking. It is
 * suitable for memory-level objects that are never queried or persisted.
 *
 * {@link Record} extends Model to add querying, persistence, and associations.
 *
 * It includes support for:
 * - Type coercion through attribute schema definitions
 * - Change tracking and dirty checking
 * - Single-table inheritance naming (modelName/baseClass)
 * - Event system for attribute changes
 *
 * @extends EventBus
 */
export default class Model extends EventBus {

    static namespace = null;
    static descendants = [];

    static abstract = true//: boolean = true;
    static schema; //: IModelSchema;
    static cidPrefix = 'm';//: string = 'm';

    // inheritanceAttribute is the attirbutes used for STI
    static inheritanceAttribute = 'type';//: string | boolean = 'type';

    static _modelName;//: Name | undefined;

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
     * @returns {Class<Model>} The base class of this model
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
     * Coerces attribute values according to their type definitions in the schema
     * @param {Object} attributes - The attribute to coerce
     * @param {Model} record - The record for which the attributes are being applied
     * @return {Object} The coerced attributes
     */
    static coerceAttributes(attributes, record=null) {
        const queue = [];
        const target = {};
        const schema = this.schema;

        const coerceAttribute = (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                const type = result(schema[key], 'type', attributes, record);
                if (type === false) { return queue.push([key, value]); }

                const Type = Types.registry[type];
                if (Type) {
                    if (Type.set(key, value, target, attributes, record, schema[key]) === false) {
                        queue.push([key, value]);
                    }
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            } else {
                target[key] = value
            }
        }

        each(attributes, coerceAttribute);
        each(queue, coerceAttribute);

        return target;
    }

    cid = uniqueId(this.constructor.cidPrefix);//: string
    attributes = {};//: { [propName: string]: any; }
    _changes = {};          // : any

    // Add a helper reference to get the model name from an model instance.
    modelName;  //: Name | undefined;
    baseClass;  //: any;
    inheritanceAttribute; //: string | boolean

    // constructor(attributes?: IModelAttributes, options?: IModelOptions)
    constructor(attributes={}, options={}) {
        super();

        if (this.constructor !== Model) {
            this.modelName = this.constructor.modelName();
            this.baseClass = this.constructor.baseClass();
        } else {
            this.modelName = undefined;
            this.baseClass = undefined;
        }

        this.inheritanceAttribute = this.constructor.getInheritanceAttribute();

        if (this.baseClass && this.modelName && this.inheritanceAttribute && this.constructor.schema && this.constructor.schema[this.inheritanceAttribute]) {
            if (this.baseClass === this.constructor && this.baseClass.descendants.length > 0) {
                attributes[this.inheritanceAttribute] = this.modelName.name;
            } else if (this.baseClass.descendants.some(c => c === this.constructor)) {
                attributes[this.inheritanceAttribute] = this.modelName.name;
            }
        }

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

        this.declareProperties(attributes, options);
        this.setDefaultAttributes(attributes);
        this.setAttributes(attributes);

        this.initialize(attributes, options);
    }

    /**
     * Hook for subclasses to declare and set up instance properties they need in
     * place before attributes are applied (e.g. {@link Record} sets up its
     * persistence flags and attaches associations here, since `setAttributes` may
     * reference them). Called after the attribute accessors are defined and before
     * `setDefaultAttributes`/`setAttributes`. Blank by default.
     * @param {Object} attributes - The attributes about to be applied
     * @param {Object} options - Construction options
     */
    declareProperties(attributes, options) {}

    /**
     * Hook for the consuming stack to run custom setup after a record is fully
     * constructed and its attributes applied. Blank by default; override without
     * calling `super`.
     * @param {Object} attributes - The attributes the record was built with
     * @param {Object} options - Construction options
     */
    initialize(attributes, options) {}

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
     * Creates a clone of this record
     * @returns {Model} A new instance with the same attributes and change state
     */
    clone() {
        const clone = new this.constructor(deepAssign({}, this.attributes))
        clone._changes = Object.assign({}, this._changes)
        return clone;
    }

    /**
     * Sets a single attribute value
     * @param {string} attribute - The attribute name to set
     * @param {*} value - The value to set
     * @returns {Model} This record instance for chaining
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
     * @returns {Model} This record instance for chaining
     * @fires Model#changed - When attributes are changed, see {@link Model#event:changed}
     * @fires Model#changed:{attribute} - When a specific attribute is changed, see {@link Model#event:changed:{attribute}}
     */
    setAttributes(attributes, {coerced=false, dirty=true}={}) {
        let changes = {};

        if (!coerced) {
            attributes = this.constructor.coerceAttributes(attributes, this);
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
                } else if (dirty) {
                    this._changes[key] = [ this.attributes[key] || null, value ];
                }
                this.attributes[key] = value;

                this.dispatchAttributeChange(key, ...changes[key]);
            } else if (!dirty && key in this._changes && !isEqual(this._changes[key][0], value)) {
                changes[key] = [this._changes[key][0], value];
                // TODO: maybe add a sync function and find out how to add
                // notifications for updated to the record where there is a
                // change in memory
                // this.dispatchEvent('synced:' + key, this, ...changes[key]);
            }

        })

        if(Object.keys(changes).length > 0) {
            this.dispatchChange(changes); //, options
        }

        return changes;
    }

    /**
     * Dispatches the record-level change event for a batch of attribute changes.
     * Subclasses override this to also notify related collections.
     * @param {Object} changes - The changes made, with [oldValue, newValue] pairs
     * @fires Model#changed
     */
    dispatchChange(changes) {
        /**
         * Fired when attributes on a record are changed
         * @event Model#changed
         * @param {Model} record - The record that was changed
         * @param {Object} changes - The changes made, with [oldValue, newValue] pairs
         */
        this.dispatchEvent('changed', this, changes);
    }

    /**
     * Dispatches the change event for a single attribute. Subclasses override
     * this to also notify related collections.
     * @param {string} key - The attribute that changed
     * @param {*} oldValue - The previous value of the attribute
     * @param {*} newValue - The new value of the attribute
     * @fires Model#changed:{attribute}
     */
    dispatchAttributeChange(key, oldValue, newValue) {
        /**
         * Fired when a specific attribute on a record is changed
         * @event Model#changed:{attribute}
         * @param {Model} record - The record that was changed
         * @param {*} oldValue - The previous value of the attribute
         * @param {*} newValue - The new value of the attribute
         */
        this.dispatchEvent('changed:' + key, this, oldValue, newValue);
    }

    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }

    /**
     * Returns a copy of the record's attributes for JSON serialization, so
     * `JSON.stringify(record)` emits the attributes rather than internal
     * state. Attribute values serialize themselves (e.g. `Date` via
     * `Date#toJSON`).
     *
     * @returns {Object} A copy of the record's attributes
     */
    toJSON() {
        return {...this.attributes};
    }
}
