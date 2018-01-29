import * as string from '../support/string';

export class Name {

    name: string;
    collectionName: string;
    singular: string;
    plural: string;
    human: string;
    title: string;
    collection: string;
    paramKey: string;
    routeKey: string;
    element: string;

    private _model: any;

    constructor (name: string) {
        let objectName = string.camelize(name);

        this.name = objectName;
        this.collectionName = objectName + 'Collection';
        this.singular = string.underscore(objectName).replace(/\//g, '_'); // namespaced_name
        this.plural = string.pluralize(this.singular); // namespaced_names
        this.human = string.humanize(string.underscore(string.demodulize(objectName))); // Name
        this.title = string.titleize(string.underscore(string.demodulize(objectName)));
        this.collection = string.pluralize(this.singular); // namespaced/names
        this.paramKey = this.singular;
        this.routeKey = this.plural;
        this.element = string.underscore(string.demodulize(objectName));
    }

    model() {
        if (this._model) {
            return this._model;
        }

        this._model = string.constantize(this.name);
        return this._model;
    }

}
