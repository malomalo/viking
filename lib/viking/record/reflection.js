import { constantize } from '../support/string';
import Name from './name';
import Model from '../record';

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
