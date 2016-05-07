Viking.Model.Name = function (name) {
    var class_name = name.camelize(); // Namespaced.Name

    this.name = class_name;
    this.singular = class_name.underscore().replace(/\//g, '_'); // namespaced_name
    this.plural = this.singular.pluralize(); // namespaced_names
    this.human = class_name.demodulize().humanize(); // Name
    this.collection = this.singular.pluralize(); // namespaced/names
    this.paramKey = this.singular;
    this.routeKey = this.plural;
    this.element = class_name.demodulize().underscore();

};
