import {camelize, demodulize, underscore, pluralize, humanize, titleize} from 'viking/support/string';

export class Name {

    klass;//: any;
    name;//: string;
    // collectionName: string;
    singular;//: string;
    plural;//: string;
    human;//: string;
    title;//: string;
    // collection: string;
    paramKey;//: string;
    routeKey;//: string;
    element;//: string;

    // _model;//private : any;

    // constructor(klass: any, name: string) {
    constructor(klass, name) {
        let objectName = camelize(name);

        this.klass = klass;
        this.name = objectName;
        // this.collectionName = objectName + 'Collection';
        this.singular = underscore(objectName).replace(/\//g, '_'); // namespaced_name
        this.plural = pluralize(this.singular); // namespaced_names
        this.human = humanize(underscore(demodulize(objectName))); // Name
        this.title = titleize(underscore(demodulize(objectName)));
        // this.collection = pluralize(this.singular); // namespaced/names
        this.paramKey = this.singular;
        this.routeKey = this.plural;
        this.element = underscore(demodulize(objectName));
    }

    // model() {
    //     if (this._model) {
    //         return this._model;
    //     }

    //     this._model = constantize(this.name);
    //     return this._model;
    // }

}
