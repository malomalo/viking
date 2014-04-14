## Edge

Minor Changes:

 - `Viking.Coercions.Number.load` now coerces an empty string to `null`
 
Bugfixes:

 - `Viking.View.Helpers#label_tag` now accepts the `escape` paramater

## 0.6.0 (April 5th, 2014)

Major Changes:

 - `FormBuilder` no longer accepts content as an argument
 - `FormBuilder#render` has been removed
 - `Viking.Viking.Helpers.formFor` is now responsible for output the `form` tags
 - Added `FormBuilder.fieldsFor` that acts similar to Rail's
   [fields\_for](http://api.rubyonrails.org/classes/ActionView/Helpers/FormBuilder.html#method-i-fields_for)
 - Added array type coercion
 - Added inital support for polymorphic belongsTo associations in `Viking.Model`
 
Minor Changes:

 - `Viking.Model#set` now changes the prototype of the model to type if type was passed
 - `Viking.Model#set` initializes new `hasMany` associations when set is called with new type
 - Added `Viking.View.Helpers.timeTag`
 - All form helpers allow the name to be passed in as an option to override the generated name
 - `Viking.View.tagNameForModelAttribute` now accepts namespace as an option
 - setting `inheritanceAttribute = false` on a Model disableds STI
 - added `Viking.View.Helpers.numberField` and `Viking.View.Helpers.numberFieldTag` helpers
 - JSON data type coercions now allows the key `type`
 
Bugfixes:

 - `Router#start` now takes `options` and passes them to `Backbone.history.start`
 - `Model#paramRoot` returns the `baseModel.modelName` when used with STI
 - `Array.toParam` and `Array.toQuery` no longer show up in array iterators
 - if default `type` set on an STI model, initializes with that model
 - Fixed issue when using STI and changing `type` the `modelName` was not being updated
 
## 0.5.0 (March 17th, 2014)

New Features:

  - added `FormBuilder` helper
  - added `Viking.View.Helpers.formFor` helper for creating and rendering `FormBuilder`s

Bugfixes:

  - `belongsTo: ['api_key']` assumes `ApiKey` is the class not `Api_key`
  
## 0.4.0 (March 3rd, 2014)

Major Changes:

  - Inital support for STI
  - `Viking.Model#url` now uses `#toParam` to get the objects key for the url
  - Removed CSRF token injection for AJAX request. Can added on a per project basis

Minor Changes:

  - `updateAttribute` & `updateAttributes` moved from `Backbone.Model` to `Viking.Model`
  
## 0.3.0 (Feburary 26th, 2014)

Major Changes:

  - Added `Viking.View.Helpers` to make rendering forms in templates easier.
  - Removed `Viking.View`, was not being used
  
Minor Changes:

 - Updated to test against Backbone v1.1.2, jQuery v2.1.0, & Underscore.js 1.4.4
 
### 0.2.0 (Feburary 21st, 2014)

New Features:

  - Added a `::where(query)` function to Model. Returns a unfetched collection with
    the predicate set to the query
  - Adding coercions for data types
  - Replaced `#save` to set errors if returned in the save
  - Added `#setErrors` function.
  - Added `String#ljust` and `String#rjust` to `Viking.Support`
  - Added `Viking.Model#touch`
  - Added `toParam` and `toQuery` methods
  
Major Changes:

  - `hasMany` collections are no longer replace but merged when set on a model
  - `Viking.Model#select` method signature has changed
  
Minor Changes:

- `Viking.Model#select` now works when the model isn't part of a collection

## 0.1.0 (June 24th, 2013)

New Features:

  - `Viking.Model`: added `#unselect` method
  - `Viking.Router`: added support for regex routes
  - `Viking.View`: a `Backbone.View` that inherits both events and
    initializers

Major Changes:

   - `Viking.Model`: `#select` now uses `model.select` instead of model attributes
   - `Viking.Controller`: Any `Viking.Controller` is now initialized and
     then the action is called. When routing to a new URL, if it is the
     same controller the new action is called but the controller is not
     reinitialized. When routing to another URL that is not using the
     controller and then back, the controller is initialized again. Also
     the current controller object is stored in `Viking.controller`

Bugfixes:

  - `Viking.Model`: Better support in older browsers for parsing ISO8601 dates
  - `Viking.Router`: Delayed the loading of the route callback until `route` is
    called. Allows Controllers and functions to be be loaded after the router.
  - `Viking.PaginatedCollection`: if `offset` is not included in a paginated
    response it's ignored. it was causing the inital request to load twice.
	
## 0.1.0 (April 30th, 2013)

Inital Release!
