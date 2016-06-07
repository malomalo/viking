Viking.Model.Name = function (name) {
    let objectName = name.camelize(); // Namespaced.Name

    this.name = objectName;
    this.collectionName = objectName + 'Collection';
    this.singular = objectName.underscore().replace(/\//g, '_'); // namespaced_name
    this.plural = this.singular.pluralize(); // namespaced_names
    this.human = objectName.demodulize().humanize(); // Name
    this.collection = this.singular.pluralize(); // namespaced/names
    this.paramKey = this.singular;
    this.routeKey = this.plural;
    this.element = objectName.demodulize().underscore();

    this.model = function () {
        if (this._model) {
            return this._model;
        }

        this._model = this.name.constantize();
        return this._model;
    }

}
