/** @namespace Viking */

// //     Viking.js <%= version %> (sha:<%= git_info[:head][:sha] %>)
// //
// //     (c) 2012-<%= Time.now.year %> Jonathan Bracy, 42Floors Inc.
// //     Viking.js may be freely distributed under the MIT license.
// //     http://vikingjs.com

// // Initial Setup
// // -------------

// import { Collection } from './viking/collection';
// import { context } from './viking/context';
// import { Controller } from './viking/controller';
// import { Cursor } from './viking/cursor';
// import { ArgumentError, NameError } from './viking/errors';
// import {
//     BelongsToReflection,
//     HasAndBelongsToManyReflection,
//     HasManyReflection,
//     HasOneReflection,
//     Model,
//     Reflection,
//     Type
// } from './viking/record';
// import { Name } from './viking/record/name';
// import {
//     BooleanType,
//     DateType,
//     JSONType,
//     NumberType,
//     StringType
// } from './viking/record/type';
// import { PaginatedCollection } from './viking/paginated_collection';
// import { Predicate } from './viking/predicate';
// import { Router } from './viking/router';
// import { ajax, sync } from './viking/sync';
// import { Helpers, View } from './viking/view';
// import { CheckBoxGroupBuilder } from './viking/view/helpers/builders/check_box_group_builder';
// import { FormBuilder } from './viking/view/helpers/builders/form_builder';

// export const Viking: any = {
//     ajax,
//     context,
//     sync,
//     urlFor: Helpers.urlFor,

//     ArgumentError,
//     CheckBoxGroupBuilder,
//     Collection,
//     Controller,
//     Cursor,
//     FormBuilder,
//     Model: Object.assign(Model, {
//         BelongsToReflection,
//         HasAndBelongsToManyReflection,
//         HasManyReflection,
//         HasOneReflection,
//         Name,
//         Reflection,
//         Type: Object.assign(Type, {
//             Boolean: BooleanType,
//             Date: DateType,
//             JSON: JSONType,
//             Number: NumberType,
//             String: StringType
//         })
//     }),
//     NameError,
//     PaginatedCollection,
//     Predicate,
//     Router,
//     View: Object.assign(View, {
//         Helpers,
//         addErrorClassToOptions: Helpers.addErrorClassToOptions,
//         dataTagOption: Helpers.dataTagOption,
//         sanitizeToId: Helpers.sanitizeToId,
//         tagNameForModelAttribute: Helpers.tagNameForModelAttribute,
//         tagOption: Helpers.tagOption,
//         tagOptions: Helpers.tagOptions

//     })

// };
