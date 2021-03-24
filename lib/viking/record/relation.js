import * as Errors from '../errors';
import Model from '../record';
import EventBus from '../eventBus';
import {each, result, uniqueId, deepAssign, clone} from '../support';
import {toQuery} from '../support/object';
import Connection from './connection';

/**
 * Viking Relation ...
 *
 * ## Events
    |event|description|arguments|
    |-----|-----------|---------|
    |onadd|a record is about to be added|record(s)_added|
    |added|a record has been added|record(s)_added|
    |onremove|a record is about to be removed|record(s)_removed|
    |removed|a record has been removed|record(s)_removed|
    |onload|the association is about to send request to load||
    |loaded|the association has been loaded|record(s)|
    |*|any event|event_name, ...arguments|
 */

// export interface IOrder {
//     [propName: string]: 'asc' | 'desc' | {
//         asc: 'nulls_first' | 'nulls_last'
//     } | {
//         desc: 'nulls_first' | 'nulls_last'
//     };
// }

export default class Relation extends EventBus {

    klass;//: typeof Model;
    target = [];//: Model[]
    loaded = false;//: boolean

    _where = [];//: any[]
    _limit = null;//: number | null
    _order = [];//: IOrder[]
    _offset = null;
    _include = [];
    _distinct = null;

    // constructor(klass: typeof Model) {
    constructor(klass) {
        super()
        this.klass = klass;
        
        // return new Proxy(this, {
        //     get: (obj, prop) => {
        //         console.log(prop)
        //         if (/^\d+$/.test(prop) || prop === 'length') {
        //             console.log('a')
        //             return obj.target[prop];
        //         } else {
        //             console.log('b')
        //             return obj[prop];
        //         }
        //     }
        // });
    }

    // spawn(): Relation {
    spawn() {
        let spawned = new Relation(this.klass);
        spawned._limit = this._limit;
        spawned._where = clone(this._where);
        spawned._order = clone(this._order);
        spawned._include = clone(this._include);
        return spawned;
    }

    // async load(): Promise<Model[]> {
    load(options={}) {
        if (this.loaded) {
            return this.target;
        }
        
        this.dispatchEvent('onload', options)

        let resolve, reject;
        let p = new Promise( (s, e) => { resolve = s; reject = e; });

        if (!this.loading) {
            this.loading = true;
            this.after_load = [[resolve, reject]];
        } else {
            this.after_load.push([resolve, reject]);
            return p;
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
        
        if (this._offset) { params.offset = this._offset; }

        if (this._include.length > 0) { params.include = this._include; }
        
        if (this._distinct) { 
            if(typeof this._distinct === "boolean") {
                params.distinct = this._distinct;
            } else {
                params.distinct_on = this._distinct;
            }
        }
        
        
        if (this._calculate) {
            path += '/calculate';
            params.select = this._calculate;
        }
        

        if (Object.keys(params).length > 0) {
            path += `?${toQuery(params)}`;
        }
        
        this.klass.connection.get(path).then((response) => {
            this.loaded = true;
            this.loading = false;

            if (this._calculate) {
                this.target = response;
            } else {
                const oldTarget = this.target
                this.target = response.map((attributes, index) => {
                    let target = this.target.find(x => x.primaryKey() == attributes[this.klass.primaryKey])
                    if (target) {
                        target.setAttributesAndAssociations(attributes)
                    } else {
                        this.dispatchEvent('onadd', target, index);
                        target = this.klass.instantiate(attributes)
                        this.dispatchEvent('added', target, index);
                    }
                    return target
                });
                
                oldTarget.filter(x => !this.target.includes(x)).forEach(record => {
                    this.dispatchEvent('onremove', record)
                    this.dispatchEvent('removed', record)
                })
            }
            
            this.dispatchEvent('loaded', options)
            
            this.after_load.forEach((callbacks) => {
                callbacks[0](this.target);
            });
            
            this.after_load = null;
        }).catch((reason) => {
            this.loaded = false;
            this.loading = false;
            this.after_load.forEach((callbacks) => {
                callbacks[1](reason);
            });
            this.after_load = null;
        });

        return p;
    }
    
    reload() {
        this.loaded = false;
        // TODO cancel active requests
        return this.load()
    }
    
    async filter(callback, thisArg) {
        await this.load()
        return this.target.filter(callback, thisArg);
    }

    // defaultOrder(): IOrder
    defaultOrder() {
        return { [this.klass.primaryKey]: 'desc' };
    }

    async all() {
        await this.load();
        return this.target;
    }

    async first() {
        // TODO just grab first from target if loaded
        let result = await this.limit(1).load();
        return result.length === 0 ? null : result[0];
    }
    
    async find(id) {
        return this.where({id: id}).first();
    }

    async last() {
        let result = await this.spawn().setReverseOrder().setLimit(1).load();
        return result.length === 0 ? null : result[0];
    }
    
    async length() {
        await this.load();
        return this.target.length;
    }

    async sum(column) {
        let result = await this.spawn().setCalculate({sum: column}).load();
        return result.length === 0 ? null : result[0];
    }

    async count() {
        let result = await this.spawn().setCalculate({count: '*'}).load();
        return result.length === 0 ? null : result[0];
    }

    async groupBy(iterator) {
        const records = {};
        await this.each(record => {
            let key = typeof iterator == 'function' ? iterator(record) : record[iterator]
            records[key] = records[key] || []
            records[key].push(record)
        });
        return records;
    }

    // async find_each() {
    //     return this.spawn().load()
    // }

    // each(callback: (v) => any) {
    async each(...args) {
        await this.load();
        this.target.forEach(...args);
    }
    forEach(...args) {
        return this.each(...args);
    }
    
    async map(...args) {
        await this.load();
        return this.target.map(...args);
    }

    // order(by: string | IOrder)
    order(by) {
        if (typeof by === 'string') {
            by = {[by]: 'desc'};
        }
        return this.spawn().addOrder(by);
    }

    where(clause) {
        return this.spawn().addWhere(clause);
    }
    
    limit(number) {
        return this.spawn().setLimit(number);
    }
    
    offset(number) {
        return this.spawn().setOffset(number);
    }
    
    includes(...args) {
        return this.spawn().setIncludes(...args);
    }
    
    distinct (...args) {
        return this.spawn().setDistinct(...args);
    }
    
    setDistinct(...on) {
        if(on.length == 0) on = true 
        this._distinct = on;
        return this;
    }

    // setOrder(by: IOrder) {
    addOrder(by) {
        this._order.push(by);
        this.loaded = false;
        return this;
    }
    
    setOrder(by) {
        this._order = by;
        this.loaded = false;
        return this;
    }

    setIncludes(...args) {
        if (args.length == 1 && Array.isArray(args[0])) {
            this._include = this._include.concat(args[0]);
        } else {
            this._include = this._include.concat(args);
        }
        this.loaded = false;
        return this;
    }
    
    setCalculate(...args) {
        if (args.length == 1) {
            this._calculate = args[0];
        } else {
            this._calculate = args;
        }
        this.loaded = false;
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
        if (this._where.length === 1 && this.isWhereMergeable(clause, this._where[0])) {
            deepAssign(this._where[0], clause);
        } else {
            if (this._where.length === 0) {
                this._where.push(clause);
            } else {
                this._where.push('AND', clause);
            }
        }

        this.loaded = false;

        return this;
    }
    
    setWhere(clause) {
        this._where = Array(clause);
        return this;
    }

    setLimit(n) {
        this._limit = n;
        this.loaded = false;
        return this;
    }
    
    getLimit() {
        return this._limit;
    }
    
    setOffset(n) {
        this._offset = n;
        this.loaded = false;
        return this;
    }
    
    getOffset() {
        return this._offset;
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
        this.loaded = false;
        return this;
    }

}