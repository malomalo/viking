import Relation from 'viking/record/relation';

Relation.prototype.initialize = function () {
    this.addEventListener('beforeLoad', () => {
        // Add Page Where
        if (this._pageWhere) {
            if (this._where.length === 0) {
                this._where.push(this._pageWhere);
            } else {
                this._where.push('AND', this._pageWhere);
            }
        }
    })
    this.addEventListener('afterLoad', () => {
        // Remove Page Where
        if (this._pageWhere) {
            const index = this._where.indexOf(this._pageWhere)
            this._where.splice(index - 1, 2);
        }
    })

    this.addEventListener(['changed:where', 'changed:limit', 'changed:order'], this.resetPage)
}

/**
    @memberof Viking.Relation
    @type {Array.object}
    @private
*/
Relation.prototype._pageAnchors = [];

/**
    @memberof Viking.Relation
    @function nextPage
    @description Sets pagePredicate to next page
    @returns {Viking.Relation}
*/
Relation.prototype.nextPage = async function () {
    let order = this._order
    if (Array.isArray(order)) order = order[0]
    const attribute = Object.keys(order)[0]
    const direction = Object.values(order)[0]
    const operation = direction == "desc" ? "lt" : "gt"
    
    if (!this._pageWhere) {
        this._pageWhere = {}
    }

    this._pageAnchors.push(this._pageWhere[attribute] ? this._pageWhere[attribute][operation] : null);
    const lastRecord = (await this.load())[this.target.length - 1]
    this._pageWhere[attribute] = {[operation]: lastRecord.readAttribute(attribute)}

    this.dispatchEvent('changePage', this._pageWhere)
    this.reload()
    return this;
}

/**
    @memberof Viking.Relation
    @function prevPage
    @description Sets pagePredicate to previous page
    @returns {Viking.Relation}
*/
Relation.prototype.prevPage = function () {
    let order = this._order
    if (Array.isArray(order)) order = order[0]
    const attribute = Object.keys(order)[0]
    const direction = Object.values(order)[0]
    const operation = direction == "desc" ? "lt" : "gt"
    const pageAnchor = this._pageAnchors.pop()
    
    if (pageAnchor) {
        this._pageWhere[attribute] = {[operation]: pageAnchor}
    } else {
        this.resetPage();
    }
    
    this.reload()
    this.dispatchEvent('changePage', this._pageWhere)
    return this;
}

/**
    @memberof Viking.Relation
    @function pagePredicate
    @description Get the relation's predicate used for the page
    @returns {Object.<string, string>}
*/
Relation.prototype.pagePredicate = function () {
    return this._pageWhere
}

/**
    @memberof Viking.Relation
    @function isPrevPage
    @description Get if previous page
    @returns {boolean}
*/
Relation.prototype.isPrevPage = function () {
    return this._pageAnchors.length > 0;
}

/**
    @memberof Viking.Relation
    @function isNextPage
    @description Get if next page
    @returns {boolean}
*/
Relation.prototype.isNextPage = async function () {
    return this.page() < await this.pageCount()
}

/**
    @memberof Viking.Relation
    @function resetPage
    @description Reset page predicate
    @returns {Viking.Relation}
*/
Relation.prototype.resetPage = function () {
    this._pageAnchors = [];
    delete this._pageWhere;
    delete this._pageCount;
    return this
}

/**
    @memberof Viking.Relation
    @function pageCount
    @description Get the total pages
    @returns {number}
*/
Relation.prototype.pageCount = function () {
    if (this._pageCount) {
        return this._pageCount
    }
    
    if (this._loadingPageCount) {
        return this._loadingPageCount
    }
    
    this._loadingPageCount = this.distinct(null).count({distinct: 'id'}).then(x => {
        this._pageCount = Math.ceil(x / this.getLimit());
        this._loadingPageCount = null;
        return this._pageCount;
    });
    
    return this._loadingPageCount;
}