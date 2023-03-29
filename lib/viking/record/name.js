import {camelize, demodulize, underscore, pluralize, humanize, titleize} from '../support/string.js';

export default class Name {

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
    constructor(klass, name, options) {
        let objectName = camelize(name);
        if (options.namespace) {
            objectName = options.namespace + '::' + objectName;
        }


        this.klass = klass;
        this.name = objectName;

        this.singular = underscore(objectName).replace(/::/g, '_');
        this.plural = pluralize(this.singular);
        this.human = humanize(underscore(demodulize(objectName)));
        this.title = titleize(underscore(demodulize(objectName)));
        this.collection = pluralize(underscore(objectName).replace(/::/g, '/'));
        this.paramKey = this.singular;
        this.routeKey = pluralize(underscore(objectName).replace(/::/g, '/'));
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
