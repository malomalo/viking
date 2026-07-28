import {camelize, underscore, pluralize, humanize, titleize} from '../support/string.js';

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
    element;//: string;

    // _model;//private : any;

    // constructor(klass: any, name: string) {
    constructor(klass, name, options) {
        let objectName = camelize(name);

        this.klass = klass;
        this.name = objectName;

        this.singular = underscore(objectName);
        this.plural = pluralize(this.singular);

        this.human = humanize(this.singular);
        this.title = titleize(this.singular);
        this.collection = pluralize(underscore(objectName));
        this.paramKey = this.singular;
        this.element = this.singular;
    }

    // model() {
    //     if (this._model) {
    //         return this._model;
    //     }

    //     this._model = constantize(this.name);
    //     return this._model;
    // }

}
