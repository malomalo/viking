import * as Errors from 'viking/errors';
import Model from 'viking/model';
import {each, result, uniqueId} from 'viking/support';
import {toQuery} from 'viking/support/object';
import Connection from 'viking/record/connection';

// export interface IOrder {
//     [propName: string]: 'asc' | 'desc' | {
//         asc: 'nulls_first' | 'nulls_last'
//     } | {
//         desc: 'nulls_first' | 'nulls_last'
//     };
// }

export default class Relation {

    klass;//: typeof Model;
    target = [];//: Model[]
    loaded = false;//: boolean

    _where = [];//: any[]
    _limit = null;//: number | null
    _order = [];//: IOrder[]
    // offset: number | null = null;
    // includes:

    // constructor(klass: typeof Model) {
    constructor(klass) {
        this.klass = klass;
    }

    // spawn(): Relation {
    spawn() {
        let clone = new Relation(this.klass);
        clone._limit = this._limit;
        clone._where = this._where;
        clone._order = this._order;
        return clone;
    }

    // async load(): Promise<Model[]> {
    async load() {
        if (this.loaded) {
            return new Promise((resolve, reject) => {
                resolve(this.target);
            });
        }

        if (!this.klass.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        let path = this.klass.urlRoot();

        let params = {};//: any
        if (this._where.length > 0) { params.where = this._where.length === 1 ? this._where[0] : this._where; }
        if (this._order.length === 0) {
            params.order = [this.defaultOrder()];
        } else {
            params.order = this._order;
        }
        if (params.order.length === 1) {
            params.order = params.order[0];
        }
        if (this._limit) { params.limit = this._limit; }

        if (Object.keys(params).length > 0) {
            path += `?${toQuery(params)}`;
        }

        return this.klass.connection.get(path).then((response) => {
            this.loaded = true;
            this.target = response.map((r) => {
                let model = new this.klass(r);
                model._persisted = true;
                return model;
            });

            return this.target;
        });
    }

    // defaultOrder(): IOrder
    defaultOrder() {
        return { [this.klass.primaryKey]: 'desc' };
    }

    async all() {
        return this.load();
    }

    async first() {
        return this.spawn().setLimit(1).load().then((v) => v.length === 0 ? null : v[0]);
    }

    async last() {
        return this.spawn().setReverseOrder().setLimit(1).load().then((v) => v.length === 0 ? null : v[0]);
    }

    // async find_each() {
    //     return this.spawn().load()
    // }

    // each(callback: (v) => any) {
    each(callback) {
        return this.load().then((v) => v.forEach(callback));
    }

    // order(by: string | IOrder)
    order(by) {
        if (typeof by === 'string') {
            by = {[by]: 'desc'};
        }
        return this.spawn().setOrder(by);
    }

    where(clause) {
        return this.spawn().addWhere(clause);
    }

    // setOrder(by: IOrder) {
    setOrder(by) {
        this._order.push(by);
        return this;
    }

    // returns true if a can be merged into b (no key collisions)
    isWhereMergeable(a, b) {
        for (let key in a) {
            let valueA = a[key];
            if (key in b) {
                let valueB = b[key];
                if (typeof valueA === 'object' && typeof valueB === 'object') {
                    if (!this.isWhereMergeable(valueA, valueB)) {
                        // console.log(valueA, valueB, key, false);
                        return false;
                    }
                } else {
                    // console.log(valueA, valueB, key, false, 1);
                    return false;
                }
            }
        }

        return true;
    }

    addWhere(clause) {
        if (this._where.length === 1) { console.log(clause, this._where[0], this.isWhereMergeable(clause, this._where[0]));}
        if (this._where.length === 1 && this.isWhereMergeable(clause, this._where[0])) {
            _merge(this._where[0], clause);
        } else {
            if (this._where.length === 0) {
                this._where.push(clause);
            } else {
                this._where.push('AND', clause);
            }
        }

        return this;
    }

    // setLimit(n: number)
    setLimit(n) {
        this._limit = n;
        return this;
    }

    setReverseOrder() {
        let newOrder = [];//: IOrder[]

        if (this._order.length === 0) {
            this._order.push(this.defaultOrder());
        }

        this._order.forEach((o) => {
            each(o, (k, v) => {
                let column = k;
                let direction;//: 'desc' | 'asc';
                let nulls;//: 'nulls_first' | 'nulls_last' | undefined;

                if (v === 'desc') {
                    direction = 'asc';
                } else if (v === 'asc') {
                    direction = 'desc';
                } else if (v.hasOwnProperty('desc')) {
                    direction = 'asc';
                    nulls = v.desc;
                } else {
                    direction = 'desc';
                    nulls = v.asc;
                }
                if (nulls === 'nulls_first') {
                    newOrder.push({
                        [column]: {
                            [direction]: "nulls_last"
                        }
                    });
                } else if (nulls === 'nulls_last') {
                    newOrder.push({
                        [column]: {
                            [direction]: "nulls_first"
                        }
                    });
                } else {
                    newOrder.push({[column]: direction});
                }
            });
        });

        this._order = newOrder;
        return this;
    }

}