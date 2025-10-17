import { constantize } from '../support/string.js';
import Model from '../record.js';

export default class Reflection {

    name;//: string;
    model;//: typeof Model | undefined;
    macro;//: string;
    // modelName: Name;

    constructor() {
        this.name = '';
        this.macro = '';
        // this.modelName = new Name('');
        // this.collectionName = '';
    }

    // klass() {
    //     if (this.macro === 'hasMany') {
    //         return this.collection();
    //     }

    //     return this.model();
    // }

    // model() {
    //     return this.modelName.model();
    // }

    // collection(): any {
    //     return constantize(this.collectionName);
    // }

}
