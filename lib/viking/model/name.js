Viking.Model.Name = function (name) {
    var objectName = name.camelize(); // Namespaced.Name

    this.name = objectName;
    this.singular = objectName.underscore().replace(/\//g, '_'); // namespaced_name
    this.plural = this.singular.pluralize(); // namespaced_names
    this.human = objectName.demodulize().humanize(); // Name
    this.collection = this.singular.pluralize(); // namespaced/names
    this.paramKey = this.singular;
    this.routeKey = this.plural;
    this.element = objectName.demodulize().underscore();

    this.model = function () {
        if (Viking.Model.Name.ObjectCache[this.name]) {
            return Viking.Model.Name.ObjectCache[this.name];
        }

        Viking.Model.Name.ObjectCache[this.name] = this.name.constantize();
        return Viking.Model.Name.ObjectCache[this.name];
    }
};

Viking.Model.Name.ObjectCache = {};
