import * as Errors from '../errors';
import {Model} from '../model';
import {toQuery} from '../support/object';
import {each as _each, merge as _merge} from 'lodash';

export interface IOrder {
    [propName: string]: 'asc' | 'desc' | {
        asc: 'nulls_first' | 'nulls_last'
    } | {
        desc: 'nulls_first' | 'nulls_last'
    };
}

export class Relation {

    klass: typeof Model;
    loaded: boolean = false;

    _where: any[] = [];
    _limit: number | null = null;
    _order: IOrder[] = [];
    // offset: number | null = null;
    // includes:


    constructor(klass: typeof Model) {
        this.klass = klass;
    }

    spawn(): Relation {
        let clone = new Relation(this.klass);
        clone._limit = this._limit;
        clone._where = this._where;
        clone._order = this._order;
        return clone;
    }

    async load(): Promise<Model[]> {
        return new Promise<Model[]>((resolve, reject) => {
            let path = this.klass.urlRoot();

            let params: any = {};
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

            let request = new XMLHttpRequest();
            request.open('GET', path,  true);
            request.setRequestHeader('Api-Version', '0.1.0');
            request.setRequestHeader('Accept', 'application/json');

            request.addEventListener('load', () => {
                if (request.status >= 200 && request.status < 299) {
                    resolve((JSON.parse(request.response) as any[]).map((r) => new this.klass(r)));
                } else if (request.status === 301) {
                    reject(new Errors.MovedPermanently());
                } else if (request.status === 400) {
                    reject(new Errors.BadRequest());
                } else if (request.status === 401) {
                    reject(new Errors.Unauthorized());
                } else if (request.status === 403) {
                    reject(new Errors.Forbidden());
                } else if (request.status === 404) {
                    reject(new Errors.NotFound());
                } else if (request.status === 410) {
                    reject(new Errors.Gone());
                } else if (request.status === 422) {
                    reject(new Errors.ApiVersionUnsupported());
                } else if (request.status === 503) {
                    reject(new Errors.ServiceUnavailable());
                } else if (request.status >= 500 && request.status < 599) {
                    reject(new Errors.ServerError(request.response));
                } else {
                    reject(new Errors.VikingError(`Unexpected response status ${request.status}`));
                }
            });

            // There was a connection error of some sort
            request.addEventListener('error', reject);

            request.responseType = 'text';
            request.send();
        });
    }

    defaultOrder(): IOrder {
        return { [this.klass.primaryKey]: 'desc' };
    }

    async first() {
        return this.spawn().setLimit(1).load().then((v) => v[0]);
    }

    async last() {
        return this.spawn().setReverseOrder().setLimit(1).load().then((v) => v[0]);
    }

    order(by: string | IOrder) {
        if (typeof by === 'string') {
            by = {[by]: 'desc'};
        }
        return this.spawn().setOrder(by);
    }

    where(clause) {
        return this.spawn().addWhere(clause);
    }

    setOrder(by: IOrder) {
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
                        console.log(valueA, valueB, key, false);
                        return false;
                    }
                } else {
                    console.log(valueA, valueB, key, false, 1);
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

    setLimit(n: number) {
        this._limit = n;
        return this;
    }

    setReverseOrder() {
        let newOrder: IOrder[] = [];

        if (this._order.length === 0) {
            this._order.push(this.defaultOrder());
        }

        this._order.forEach((o) => {
            _each(o, (v, k) => {
                let column = k;
                let direction: 'desc' | 'asc';
                let nulls: 'nulls_first' | 'nulls_last' | undefined;

                if (v === 'desc') {
                    direction = 'asc';
                } else if (v === 'asc') {
                    direction = 'desc';
                } else if (v.hasOwnProperty('desc')) {
                    direction = 'asc';
                    nulls = (v as any).desc;
                } else {
                    direction = 'desc';
                    nulls = (v as any).asc;
                }
                if (nulls === 'nulls_first') {
                    newOrder.push({
                        [column]: {
                            [direction]: "nulls_last"
                        }
                    } as IOrder);
                } else if (nulls === 'nulls_last') {
                    newOrder.push({
                        [column]: {
                            [direction]: "nulls_first"
                        }
                    } as IOrder);
                } else {
                    newOrder.push({[column]: direction});
                }
            });
        });

        this._order = newOrder;
        return this;
    }

}