// Viking.js <%= version %> (sha:<%= git_info[:head][:sha] %>)
// 
// (c) 2012-<%= Time.now.year %> Jonathan Bracy, 42Floors Inc.
// Viking.js may be freely distributed under the MIT license.
// http://vikingjs.com

import './viking/support';
import sync from './viking/sync';
import View from './viking/view';
import Model from './viking/model';
import Cursor from './viking/cursor';
import Router from './viking/router';
import Predicate from './viking/predicate';
import Controller from './viking/controller';
import Collection from './viking/collection';
import PaginatedCollection from './viking/paginated_collection';

const Viking = {
    sync: sync,
    Model: Model,
    Cursor: Cursor,
    Collection: Collection,
    Predicate: Predicate,
    PaginatedCollection: PaginatedCollection,
    Controller: Controller,
    Router: Router,
    View: View
};

export default Viking;
