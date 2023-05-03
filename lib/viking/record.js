import * as Errors from './errors';
import EventBus from './eventBus';
import {each, result, uniqueId, isEqual, deepAssign, isFunction, pick} from './support';
import {isPlainObject} from './support/object';
import { Name } from './record/name';
// import { Reflection } from './model/reflection';
// import { BelongsToReflection } from './model/reflections/belongs_to_reflection';
// import { HasAndBelongsToManyReflection } from './model/reflections/has_and_belongs_to_many_reflection';
// import { HasManyReflection } from './model/reflections/has_many_reflection';
// import { HasOneReflection } from './model/reflections/has_one_reflection';
import Types from './record/types';
import Relation from './record/relation';
import * as string from './support/string';


// export interface IModelAttributes {
//     [propName: string]: any;
// }
//
// export interface IModelOptions {
// }
//
// export interface IModelSchema {
//     [propName: string]: {
//         type?: string;
//         array?: boolean;
//         default?: any;
//     };
// }

// Viking.Record
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
//
// Events
// ------
//  | event                 | arguments    | description |
//  | -----                 | -----------  | ----------- |
//  |beforeAdd|association|record is about to be added to an association
//  |afterAdd|association|record has been added to an association
//  |beforeRemove|association|record is about to be removed from an association
//  |afterRemove|association|record has been removed from an association
//  |invalid|errors|record has failed to save because it is invalid
//  | beforeCreate                 | record, changes | record has successfully created |
//  | beforeSave                 | record, changes | before record has is saved |
//  | afterSave                 | record, changes | after ecord has successfully saved |
//  | afterSave:[attribute]     | record, oldValue, newValue |
//  | afterCreate                 | record, changes | record has successfully created |
//  | changed                | record, changes |
//  | changed:[attribute]    | record, oldValue, newValue |
//  |beforeDestroy||record is about to request to destroy
//  |afterDestroy||record has successfully destroed to api
//  | *                     | event_name, record, ...arguments |
//  | error | response | when there's a server error
//  | invalid | response | when server responds with invalid errors for record
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
    
    static initializeAssociations() {
        if (!this.hasOwnProperty('_associations')) {
            this._associations = {};
            this.associations.forEach((association) => {
                association = new association.reflection(...association.args);
                this._associations[association.name] = association;
            });
        }
    }
    
    static reflectOnAssociation(name) {
        this.initializeAssociations();
        return this._associations[name];
    }
    
    static reflectOnAllAssociations() {
        this.initializeAssociations();
        return Object.values(this._associations);
    }

    static getInheritanceAttribute() {
        if (this.hasOwnProperty('inheritanceAttribute')) {
            return this.inheritanceAttribute;
        } else {
            return 'type';
        }
    }

    // static modelName(): Name
    static modelName() {
        if (!this._modelName) {
            this._modelName = new Name(this, this.name, {
                namespace: this.namespace
            });
        }
        return this._modelName;
    }

    // static baseModel(): any
    static baseClass() {
        if (
             (this.__proto__.hasOwnProperty('abstract') && this.__proto__.abstract)
             ||
             this.__proto__.getInheritanceAttribute() === false
            ) {
            return this;
        } else {
            return this.__proto__.baseClass();
            // this.baseClass.descendants.push(this);
        }
    }

    // Generates the `urlRoot` based off of the class name.
    static urlRoot() {
        if (this.path) {
            return this.path;
        } else {
            return "/" + this.baseClass().modelName().routeKey;
        }
    }

    // static all(): Relation
    static all() {
        return new Relation(this);
    }

    // static limit(number: number): Relation
    static limit(number) {
        return new Relation(this).limit(number);
    }
    
    // static where(query: any): Relation
    static where(query) {
        return new Relation(this).where(query);
    }
    
    // static where(query: any): Relation
    static sum(...args) {
        return new Relation(this).sum(...args);
    }
    
    // static where(query: any): Relation
    static count(...args) {
        return new Relation(this).count(...args);
    }
    
    // Instantiate a new instance of the appropriate class.
    //
    // For example, `Post.all()` may return Comments, Messages, and Emails
    // by storing the record's subclass in a +type+ attribute. By calling
    // `instantiate` instead of `new`, finder methods ensure they get new
    // instances of the appropriate class for each record.
    //
    // See `ActiveRecord::Inheritance#discriminate_class_for_record` to see
    // how this "single-table" inheritance mapping is implemented.
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
    //
    // static async find(id)
    static async find(id) {
        return this.where({ [this.primaryKey]: id }).first();
    }

    static async first() {
        return this.all().first();
    }

    static async last() {
        return this.all().last();
    }

    static async forEach(callback) {
        return this.all().forEach(callback);
    }
    
    static includes(...args) {
        return this.all().includes(...args);
    }
    
    static limit(limit) {
        return this.all().limit(limit);
    }

    // Create a model with +attributes+. Options are the
    // same as Viking.Model#save
    static async create(attributes, options = {}) {
      var model = new this(attributes);
      await model.save(options);
      return model;
    }

    static async create$(attributes, options = {}) {
      var model = new this(attributes);
      await model.save$(options);
      return model;
    }

    cid = uniqueId(this.constructor.cidPrefix);//: string 
    inheritanceAttribute = this.constructor.getInheritanceAttribute(); //: string | boolean
    attributes = {};//: { [propName: string]: any; }
    _new_record = true;//: boolean
    _destroyed  = false;
    _changes = {};// : any
    _associations = {};//: { [propName: string]: any; }
    errors = {};
    
    // Add a helper reference to get the model name from an model instance.
    modelName;//: Name | undefined;
    baseClass;//: any;
    
    // constructor(attributes?: IModelAttributes, options?: IModelOptions)
    constructor(attributes, options) {
        super();
        
        if (this.constructor !== Record) {
            this.modelName = this.constructor.modelName();
            this.baseClass = this.constructor.baseClass();
        } else {
            this.modelName = undefined;
            this.baseClass = undefined;
        }

//         if (this.baseModel && this.modelName && this.inheritanceAttribute) {
//             if (this.baseModel === this.constructor && this.baseModel.descendants.length > 0) {
//                 attrs[this.inheritanceAttribute] = this.modelName.name;
//             } else if (_.contains(this.baseModel.descendants, this.constructor)) {
//                 attrs[this.inheritanceAttribute] = this.modelName.name;
//             }
//         }
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
        this.setAttributes(this.defaults());
        
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

    // Alias for `::urlRoot`
    // urlRoot: string | (() => string) = () => {
    urlRoot() {
        return result(this.constructor, 'urlRoot');
    }


    defaults() {
        let dflts = {};
        each(this.constructor.schema, (key, options) => {
            if (options.default) {
                dflts[key] = result(options, 'default');
            }
        });

        return dflts;
    }

    // Get the value of an attribute.
    //
    // readAttribute(attributeName: string)
    readAttribute(attributeName) {
        return this.attributes[attributeName];
    }

    // Returns true if the given attribute is in the attributes hash, otherwise
    // false.
    //
    // hasAttribute(attributeName: string)
    hasAttribute(attributeName) {
        return attributeName in this.attributes;
    }

    // Returns string to use for params names. This is the key attributes from
    // the model will be namespaced under when saving to the server
    paramRoot() {
        if (this.baseClass) {
            return this.baseClass.modelName().paramKey;
        }
    }

    isPersisted() {
        return !(this._new_record || this._destroyed);
    }

    persist() {
        this._new_record = false;
        this._changes = {};
        return this;
    }

    isNewRecord() {
        return this._new_record;
    }
    
    destroyed() {
        return this._destroyed
    }

    clone() {
        const clone = new this.constructor(deepAssign({}, this.attributes))
        clone._new_record = this._new_record
        clone._destroyed = this._destroyed
        clone._changes = Object.assign({}, this._changes)
        return clone;
    }

    changes() {
        return this._changes;
    }
    
    changedAttributes() {
        return Object.keys(this._changes);
    }

    hasChanged(attributeName) {
        if (attributeName) {
            return (attributeName in this._changes);
        } else {
            return (Object.keys(this._changes).length > 0);
        }
    }

    needsSaved() {
        return this.isNewRecord() ||
            this.hasChanged() ||
            Object.values(this._associations).some(a => a.needsSaved());
    }
    
    coerceAttributes(changes) {
        const queue = [];
        const schema = this.constructor.schema;
        
        const coerceAttribute = (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                const Type = Types.registry[schema[key].type];
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
    
    setAttribute(attribute, value) {
        return this.setAttributes({
            [attribute]: value
        })
    }
    
    // setAttributes(attributes: object)
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
                    this.dispatchEvent('changed', this, changes); //, options
                }
            // }

        // this._pending = false;
        // this._changing = false;
        if (Object.keys(changes).length > 0) {
            this.dispatchEvent('changed', this, changes); //, options
        }
        return this;
    }
    
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
        
        this.setAttributes(attributes);
    }


    primaryKey() {
        return this.readAttribute(this.constructor.primaryKey);
    }

    // Returns a string representing the object's key suitable for use in URLs,
    // or nil if `#isNew` is true.
    toParam() {
        // return this.isNewRecord() ? null : this.readAttribute('id');
        return this.readAttribute(this.constructor.primaryKey);
        // string.parameterize
    }

    // Default URL for the model's representation on the server
    // url(): string {
    url() {
        let base = result(this, 'urlRoot');

        if (!base) {
            throw new Error('A "urlRoot" property or function must be specified');
        }

        // if (this.isNewRecord()) {
        //     return base;
        // }

        return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.toParam());
    }

    asJSON() {
        return this.dumpAttributes(this.attributes);
    }

    dumpAttributes(attributes) {
        const dump = {};
        const schema = this.constructor.schema;
        
        each(attributes, (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                const Type = Types.registry[schema[key].type]
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
    
    async save$(options = {}) {
        let saved = await this.save();
        
        if (!saved) {
            throw new Errors.RecordNotSaved("Failed to save the record");
        }
    }
    
    optionsForSync(event, options={}) {
        const wasNew = this.isNewRecord();
        
        if (event == 'save') {
            const changes = this.changes();
            if (wasNew) {
                this.dispatchEvent('beforeCreate', changes, options);
            }
            this.dispatchEvent('beforeSave', changes, options);
        }
        this.dispatchEvent('beforeSync', options);
        
        if (event == 'save') {
            if (options.body && isPlainObject(options.body)) {
                options.body = deepAssign({ [this.paramRoot()]: this.attributesForSave() }, options.body);
            } else if (!options.body) {
                options.body = { [this.paramRoot()]: this.attributesForSave()};
            }
        }
        
        options.success = (response) => {
            this.setAttributesAndAssociations(response, false);
            let savedChanges = {};
            deepAssign(savedChanges, this._changes);
            this.persist();
            if (event == 'save') {
                if(wasNew) {
                    this.dispatchEvent('afterCreate', savedChanges, options);
                }
                this.dispatchEvent('afterSave', savedChanges, options);
            }
            this.dispatchEvent('afterSync', savedChanges, options);
            
            each(savedChanges, (key, value) => {
                this.dispatchEvent('afterSync:'+key, value[0], value[1]);
            });
            
            return true;
        }

        options.invalid = (request, error_callback) => {
            if (request.getResponseHeader('Content-Type').startsWith('application/json')) {
                this.errors = JSON.parse(request.responseText).errors;
                this.dispatchEvent('invalid', this.errors, options);
                return false;
            } else {
                this.dispatchEvent('invalid', response)
            }
        }
        
        options.error = (response) => {
            this.dispatchEvent('error', response)
        }
        
        return options;
    }
    
    async save(options = {}) {
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }
        if (!this.needsSaved()) { return }
        
        let method = this.isNewRecord() ? 'post' : 'put';
        let path   = this.isNewRecord() ? result(this, 'urlRoot') : this.url();
        
        return await this.constructor.connection[method](path, this.optionsForSync('save', options));
    }
    
    async reload(options = {}) {
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }
        
        if (this.isNewRecord()) { return }
        
        return await this.constructor.connection.get(this.url(), this.optionsForSync('reload', options));
    }
    
    async destroy(options = {}) {
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        if (this.isNewRecord() || this.destroyed()) {
            // ... raise error
        }
        
        this.dispatchEvent('beforeDestroy', this, options)
        await this.constructor.connection.delete(this.url()).then(() => {
            this.dispatchEvent('afterDestroy', this, options)
        });
        this._destroyed = true;
    }
    
    errorsOn(attribute) {
        return !!this.errors[attribute];
    }
    
    association(name) {
        return this._associations[name]
    }
}