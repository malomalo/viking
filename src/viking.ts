//     Viking.js <%= version %> (sha:<%= git_info[:head][:sha] %>)
//
//     (c) 2012-<%= Time.now.year %> Jonathan Bracy, 42Floors Inc.
//     Viking.js may be freely distributed under the MIT license.
//     http://vikingjs.com

// Initial Setup
// -------------

import { Collection } from './viking/collection';
import { context } from './viking/context';
import { Controller } from './viking/controller';
import { Cursor } from './viking/cursor';
import { ArgumentError, NameError } from './viking/errors';
import {
    BelongsToReflection,
    HasAndBelongsToManyReflection,
    HasManyReflection,
    HasOneReflection,
    Model,
    Reflection,
    Type
} from './viking/model';
import {
    BooleanType,
    DateType,
    JSONType,
    NumberType,
    StringType
} from './viking/model/type';
import { PaginatedCollection } from './viking/paginated_collection';
import { Predicate } from './viking/predicate';
import { Router } from './viking/router';
import { ajax, sync } from './viking/sync';
import { Helpers, View } from './viking/view';

export const Viking: any = {
    ajax,
    context,
    sync,
    urlFor: Helpers.urlFor,

    ArgumentError,
    Collection,
    Controller,
    Cursor,
    Model: Object.assign(Model, {
        BelongsToReflection,
        HasAndBelongsToManyReflection,
        HasManyReflection,
        HasOneReflection,
        Reflection,
        Type: Object.assign(Type, {
            Boolean: BooleanType,
            Date: DateType,
            JSON: JSONType,
            Number: NumberType,
            String: StringType
        })
    }),
    NameError,
    PaginatedCollection,
    Predicate,
    Router,
    View: Object.assign(View, {
        Helpers
    })

};
