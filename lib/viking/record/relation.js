import * as Errors from '../errors.js';
import Model from '../record.js';
import EventBus from '../eventBus.js';
import {each, result, uniqueId, deepAssign, clone} from '../support.js';
import {toQuery} from '../support/object.js';
import Connection from './connection.js';

// export interface IOrder {
//     [propName: string]: 'asc' | 'desc' | {
//         asc: 'nulls_first' | 'nulls_last'
//     } | {
//         desc: 'nulls_first' | 'nulls_last'
//     };
// }

/**
 * An attribute of the relation was changed
 *
 * @event Relation#changed
 * @param {("distinct" | "limit" | "offset" | "order" | "where")} attribute The attribute on the query/relation that changed
 * @param {*} newValue The new value of the attribute
 */

/**
 * attribute of the relation was changed; where `attribute` is any of the following
 * `"distinct"`, `"limit"`, `"offset"`, `"order"`, `"where"`
 *
 * @event Relation#changed:[attribute]
 * @param {*} newValue The new value of the attribute
 */

/**
 * @extends EventBus
 * @param {Record} klass A Model `class`, not an instance of the `klass`
 */
export default class Relation extends EventBus {

    klass;//: typeof Model;
    target = []; //: Model[]
    loaded = false;//: boolean
    controlledAborts = [];
    
    _where = [];//: any[]
    _limit = null;//: number | null
    _order = [];//: IOrder[]
    _offset = null;
    _include = [];
    _distinct = null;
    _groupValues = [];

    constructor(klass) {
        super()
        this.klass = klass;
        this.initialize();
    }
    
   /**
    * placeholder function for extending
    *
    */
    initialize() {}

   /**
    * @return {Relation}
    */
    spawn() {
        let spawned = new Relation(this.klass);
        spawned._limit = this._limit;
        spawned._where = clone(this._where);
        spawned._order = clone(this._order);
        spawned._include = clone(this._include);
        spawned._distinct = clone(this._distinct);
        spawned._groupValues = clone(this._groupValues);
        return spawned;
    }

    /**
     * Load and return the relation.
     *
     * If the relation is loaded the loaded relation will be returned and no
     * events will be fired.
     *
     * Use [reload]{@linkcode Relation#reload} if you wish to fetch the
     * relation from the server again.
     *
     * If there is currently a request in flight to fetch the relation from the
     * server the result of that request will be returned after the original
     * load finishes. A new request will not be sent.
     *
     * @async
     * @instance
     * @param {...*} eventParameters Parameters to pass to events fired in this function
     * @return {Record[]}
     *
     * @fires [beforeLoad]{@link Relation#event:beforeLoad}
     * @fires [beforeSetTarget]{@link Relation#event:beforeSetTarget}
     * @fires [afterAdd]{@link Relation#event:afterAdd}
     * @fires [afterRemove]{@link Relation#event:afterRemove}
     * @fires [afterLoad]{@link Relation#event:afterLoad}
     */
    load(...eventParameters) {
        if (this.loaded) {
            return this.target;
        }

        let resolve, reject;
        let p = new Promise( (s, e) => { resolve = s; reject = e; });

        if (!this.loading && this.after_load) {
            this.after_load.push([resolve, reject]);
        } else if (!this.loading) {
            this.after_load = [[resolve, reject]];
        } else {
            this.after_load.push([resolve, reject]);
            return p;
        }
        
        /**
         * Fired before sending the request to the server to load the records.
         *
         * @event Relation#beforeLoad
         * @param {Record[]} records The current records in memory
         * @param {...*} eventParameters optional parameters from the {@link Relation#load} call
         *               that get passed to the callbacks.
         */
        this.dispatchEvent('beforeLoad', this.target, ...eventParameters)

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
        
        if (this._groupValues.length == 1) {
            params.group_by = this._groupValues[0];
        } else if (this._groupValues.length > 1) {
            params.group_by = this._groupValues;
        }
        
        if (this._calculate) {
            path += '/calculate';
            params.select = this._calculate;
        }

        if (Object.keys(params).length > 0) {
            path += `?${toQuery(params)}`;
        }
        
        const request = this.klass.connection.get(path);
        this.loading = request;
        this.loading.then((response) => {
            this.loaded = true;
            this.loading = false;

            if (this._calculate) {
                this.target = response;
            } else {
                this.setTarget(response.map((attributes, index) => {
                    let target = this.target.find(x => x.primaryKey() == attributes[this.klass.primaryKey])
                    if (target) {
                        target.setAttributesAndAssociations(attributes)
                    } else {
                        target = this.klass.instantiate(attributes)
                    }
                    return target
                }), ...eventParameters)
            }
            
            /**
             * Fired after the request to the server has been returned and
             * processed and the models are loaded.
             *
             * @event Relation#afterLoad
             * @param {Record[]} records The current records in memory
             * @param {...*} eventParameters optional parameters from the {@link Relation#load} call
             *               that get passed to the callbacks.
             */
            this.dispatchEvent('afterLoad', this.target, ...eventParameters)
            
            this.after_load.forEach((callbacks) => {
                callbacks[0](this.target);
            });
            
            this.after_load = null;
        }).catch((reason) => {
            if (this.controlledAborts.includes(request)) {
                this.controlledAborts = this.controlledAborts.filter((xhr) => xhr !== request);
            } else {
                this.loaded = false;
                this.loading = false;
                this.after_load.forEach((callbacks) => {
                    callbacks[1](reason);
                });
                this.after_load = null;
            }
        });

        return p;
    }

    /**
     * Sets the records of this relation, removing and adding records as necessary.
     *
     * @instance
     * @param  {Record[]} records
     * @param {...*} eventParameters Parameters to pass to events fired in this function
     *
     * @fires [beforeSetTarget]{@link Relation#event:beforeSetTarget}
     * @fires [afterAdd]{@link Relation#event:afterAdd}
     * @fires [afterRemove]{@link Relation#event:afterRemove}
     */
    setTarget(records, ...eventParameters) {
        /**
         * Fired before setting (adding or removing) the records of the relation.
         *
         * @event Relation#beforeSetTarget
         * @param {Record[]} newRecords The records that are being set
         * @param {Record[]} currentRecords The records that are currently
         *                                         loaded
         * @param {...*} eventParameters optional parameters from the
         *               {@link Relation#setTarget} call that gets
         *               passed to the callbacks.
         */
        this.dispatchEvent('beforeSetTarget', records);

        const oldTarget = this.target
        this.target = records;
        
        const addedRecords = this.target.filter(x => !oldTarget.includes(x))
        if (addedRecords.length > 0) {
            this.connectRecords(addedRecords, ...eventParameters)
        }
        
        const removedRecords = oldTarget.filter(x => !this.target.includes(x))
        if(removedRecords.length > 0) {
            this.disconnectRecords(removedRecords, ...eventParameters)
        }
    }
    
    add (...records) {
        records = records.filter(r => this.target.findIndex(x => x.cid == r.cid) == -1)
        this.target.push(...records)
        this.connectRecords(records)
    }

    connectRecords (addedRecords, ...eventParameters) {
        addedRecords.forEach(r => r.collections.add(this))
        /**
         * Fired when records are added to the relation. Will *not* be called
         * for any records already in memory.
         *
         * @event Relation#afterAdd
         * @param {Record[]} addedRecords The records that were added
         *                          to the relation
         * @param {...*} eventParameters optional parameters from the
         *               {@link Relation#setTarget} call that gets
         *               passed to the callbacks.
         */
        this.dispatchEvent('afterAdd', addedRecords, ...eventParameters);
    }
    
    remove (...records) {
        this.target = this.target.filter(x => !records.includes(x))
        this.disconnectRecords(records)
    }
    
    disconnectRecords (removedRecords, ...eventParameters) {
        removedRecords.forEach(r => r.collections.delete(this))
        /**
         * Fired when records are removed to the relation.
         *
         * @event Relation#afterRemove
         * @param {Record[]} removedRecords The records that were
         *                          removed from the relation
         * @param {...*} eventParameters optional parameters from the
         *               {@link Relation#setTarget} call that gets
         *               passed to the callbacks.
         */
        this.dispatchEvent('afterRemove', removedRecords, ...eventParameters)
    }
    
    /**
     * Load the relation from the server even if it's in memory.
     *
     * If there is currently a request in flight to fetch the relation it will
     * be cancelled and a new request will be sent. The result of the new request
     * will be used to fullfill the promise of the original request before
     * fulling the promise of the new request.
     *
     * @async
     * @instance
     * @param  {...*} eventParameters Parameters to pass to events fired in this function
     * @return {Record[]}
     *
     *
     * @fires [beforeLoad]{@link Relation#event:beforeLoad}
     * @fires [beforeSetTarget]{@link Relation#event:beforeSetTarget}
     * @fires [afterAdd]{@link Relation#event:afterAdd}
     * @fires [afterRemove]{@link Relation#event:afterRemove}
     * @fires [afterLoad]{@link Relation#event:afterLoad}
     */
    reload(...eventParameters) {
        if (this.loading) {
            this.controlledAborts.push(this.loading)
            this.loading.abort();
            this.loaded = false;
            this.loading = false;
        } else {
            this.loaded = false;
        }
        return this.load(...eventParameters);
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

    async count(column) {
        let result = await this.spawn().setCalculate({count: column || '*'}).load();
        if (Array.isArray(result)) {
            return result.length === 0 ? null : result[0];
        } else {
            return result;
        }
        
    }

    // async find_each() {
    //     return this.spawn().load()
    // }

    // forEach(callback: (v) => any) {
    async forEach(...args) {
        await this.load();
        this.target.forEach(...args);
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
        return this.spawn().applyOrder(by);
    }
    
    reorder(by) {
        if (typeof by === 'string') {
            by = {[by]: 'desc'};
        }
        return this.spawn().setOrder(by);
    }

    where(clause) {
        return this.spawn().applyWhere(clause);
    }

    rewhere(clause) {
        return this.spawn().applyRewhere(clause);
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

   /**
    * Group the results by a attribute
    *
    * @instance
    * @param {...*} on Attributes to group the results by
    *
    * @returns {{attribute: Record[]}}
    */
    groupBy(...on) {
        return this.spawn().applyGroupBy(...on);
    }

    setDistinct(...on) {
        if(on.length == 0) on = true 
        this._distinct = on;
        this.dispatchEvent('changed', 'distinct', on)
        this.dispatchEvent('changed:distinct', on)
        return this;
    }
    
    applyGroupBy(...on) {
        this._groupValues.push(...on);
        return this;
    }

    // setOrder(by: IOrder) {
    applyOrder(by) {
        this._order.push(by);
        this.loaded = false;
        this.dispatchEvent('changed', 'order', by)
        this.dispatchEvent('changed:order', by)
        return this;
    }
    
    setOrder(by) {
        this._order = by;
        this.loaded = false;
        this.dispatchEvent('changed', 'order', by)
        this.dispatchEvent('changed:order', by)
        return this;
    }

    setIncludes(...args) {
        if (args.length == 1 && Array.isArray(args[0])) {
            this._include = this._include.concat(args[0]);
        } else {
            this._include = this._include.concat(args);
        }
        this.loaded = false;
        this.dispatchEvent('changed', 'order', args)
        this.dispatchEvent('changed:order', args)
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
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }

        return true;
    }
    
    applyWhere(clause) {
        if (this._where.length === 1 && this.isWhereMergeable(clause, this._where[0])) {
            deepAssign(this._where[0], clause);
        } else if (this._where.length === 0) {
            this._where.push(clause);
        } else {
            this._where.push('AND', clause);
        }

        this.loaded = false;

        this.dispatchEvent('changed', 'where', clause)
        this.dispatchEvent('changed:where', clause)
        return this;
    }

    removeWheresForKey(key, wheres) {
        if (Array.isArray(wheres)) {
            each(wheres, (w) => this.removeWheresForKey(key, w));
        } else if (wheres.hasOwnProperty(key)) {
            delete wheres[key];
        }
    }
    
    removeConflictingWheres(clause) {
        if (Array.isArray(clause)) {
            each(clause, (c) => this.applyRewhere(c));
        } else {
            each(clause, (key, value) => {
                this.removeWheresForKey(key, this._where);
            });
        }
    }

    applyRewhere(clause) {
        this.removeConflictingWheres(clause);
        this._where = this._where.filter(o => Object.keys(o).length !== 0);
        if (this._where.length === 1 && this.isWhereMergeable(clause, this._where[0])) {
            deepAssign(this._where[0], clause);
        } else if (this._where.length === 0) {
            this._where.push(clause);
        } else {
            this._where.push('AND', clause);
        }

        this.loaded = false;

        this.dispatchEvent('changed', 'where', clause)
        this.dispatchEvent('changed:where', clause)
        
        return this;
    }
    
    setWhere(clause) {
        this._where = Array(clause);
        this.dispatchEvent('changed', 'where', clause)
        this.dispatchEvent('changed:where', clause)
        return this;
    }

    setLimit(n) {
        this._limit = n;
        this.loaded = false;
        this.dispatchEvent('changed', 'limit', n)
        this.dispatchEvent('changed:limit', n)
        return this;
    }
    
    getLimit() {
        return this._limit;
    }
    
    setOffset(n) {
        this._offset = n;
        this.loaded = false;
        this.dispatchEvent('changed', 'offset', n)
        this.dispatchEvent('changed:offset', n)
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

        this.dispatchEvent('changed', 'order', newOrder)
        this.dispatchEvent('changed:order', newOrder)
        return this;
    }

}
