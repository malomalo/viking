// Below is the same code from the Backbone.Model function
// except where there are comments
export const constructor = function (attributes, options) {
    let attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};

    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));

    if (this.inheritanceAttribute) {
        if (attrs[this.inheritanceAttribute] && this.constructor.modelName.name !== attrs[this.inheritanceAttribute]) {
            // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
            // this is accomplished, is strongly discouraged, because it is very
            // slow and unavoidably slows down subsequent execution in modern
            // JavaScript implementations
            // Ideas: Move to Model.new(...) method of initializing models
            let type = attrs[this.inheritanceAttribute].camelize().constantize();
            this.constructor = type;
            this.__proto__ = type.prototype;
        }
    }

    // Add a helper reference to get the model name from an model instance.
    this.modelName = this.constructor.modelName;
    this.baseModel = this.constructor.baseModel;

    if (this.baseModel && this.modelName && this.inheritanceAttribute) {
        if (this.baseModel === this.constructor && this.baseModel.descendants.length > 0) {
            attrs[this.inheritanceAttribute] = this.modelName.name;
        } else if (_.contains(this.baseModel.descendants, this.constructor)) {
            attrs[this.inheritanceAttribute] = this.modelName.name;
        }
    }

    // Set up associations
    this.associations = this.constructor.associations;
    this.reflectOnAssociation = this.constructor.reflectOnAssociation;
    this.reflectOnAssociations = this.constructor.reflectOnAssociations;

    // Initialize any `hasMany` relationships to empty collections
    this.reflectOnAssociations('hasMany').forEach(function(association) {
        this.attributes[association.name] = new (association.collection())();
    }, this);

    if (options.collection) { this.collection = options.collection; }
    if (options.parse) { attrs = this.parse(attrs, options) || {}; }

    this.set(attrs, options);
    this.changed = {};
    this.initialize.call(this, attributes, options);
}
