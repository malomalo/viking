<div id="Model"></div>
Model
=====

<div id="Model-extend"></div>
::extend `Viking.Model.extend([name], properties, [classProperties])`
---------------------------------------------------------------------

To create a `Viking.Model` of your own extend `Viking.Model` and provide a
combination of `name`, `properties`, and `classProperties`.

### Paramaters

- __name__ _(optional)_

  The model name as a string. This is used to generate urls and the
  `paramRoot` when sending request to the server.

- __properties__

  Instance properties. [See Backone](http://backbonejs.org/#Model-extend)
  
- __classProperties__ _(optional)_

  Class properties. [See Backone](http://backbonejs.org/#Model-extend)
  
{% highlight bash %}
// With the name parameter
var Note = Viking.Model.extend('note', {
    initialize: function() { ... }
}, {
    find_by_user: function() { ... }
});

// Normal Backbone way also works
var Note = Viking.Model.extend({
    initialize: function() { ... }
});
{% endhighlight %}

<div id="Model-urlRoot"></div>
::urlRoot `Model.urlRoot()`
---------------------------

Returns the URL of the collection.

{% highlight bash %}
var Note = Viking.Model.extend('note');

Note.urlRoot() // => "/notes"
{% endhighlight %}

<div id="Model-find"></div>
::find `Model.find(id, options)`
--------------------------------

Find model by `id`. Accepts `success` and `error` callbacks in the `options`
hash, which are both passed `(model, response, options)` as arguments.

Find returns the model, however it most likely won't have fetched the data
from the server if you immediately try to use attributes of the model.

{% highlight bash %}
var Note = Viking.Model.extend('note');

var note = Note.find(10, {
	success: function(note) {
		...
	},
	error: function(note) {
		...
	}
});
{% endhighlight %}

<div id="Model-getRelationshipDetails"></div>
::getRelationshipDetails `Viking.Model.getRelationshipDetails(relation, key, options)`
--------------------------------------------------------------------------------------

Used internally by Viking to translate relation arguments to `key` and `Model`.

Also accepts arguments in the format of: `getRelationshipDetails(relation, [key, options])`

{% highlight bash %}
Viking.Model.getRelationshipDetails('belongsTo', 'user') // => {key: 'user', type: User}

Viking.Model.getRelationshipDetails('belongsTo', 'user', {model: 'Account'}) // => {key: 'user', type: Account}

Viking.Model.getRelationshipDetails('belongsTo', ['user', {model: 'Account'}]) // => {key: 'user', type: Account}

Viking.Model.getRelationshipDetails('hasMany', 'carriers') // => {key: 'carriers', type: CarrierCollection}

Viking.Model.getRelationshipDetails('hasMany', 'carriers', {model: 'Ship'}) // => {key: 'carriers', type: ShipCollection}
{% endhighlight %}

<div id="Model-initialize"></div>
\#constructor / #initialize `new Model([attributes], [options])`
----------------------------------------------------------------

Same as [Backbone](http://backbonejs.org/#Model-constructor), but
`{collection: ...}` is unnecessary to compute the mode's url if the model `name`
is defined when creating the model.

<div id="Model-set"></div>
\#set `model.set(attributes, [options])`
----------------------------------------

Same as [Backbone](http://backbonejs.org/#Model-set), but coerces attributes
to a the appropriate model if it is a relation.

<div id="Model-select"></div>
\#select `model.select([multiple])`
-----------------------------------

When the model is part of a collection and you want to select a single or
multiple items from a collection. If a model is selected `model.selected`
will be set `true`, otherwise it will be `false`.

By default any other models in the collection with be unselected. To prevent
other models in the collection from being unselected you can pass `true`.

The `selected` and `unselected` events are fired when appropriate.

<div id="Model-unselect"></div>
\#unselect `model.unselect()`
-----------------------------

When the model is part of a collection and is selected, `model.unselect` will
unselect the model from the collection. `model.selected` will be set `false`.

Triggers an `unselected` event.

<div id="Model-toJSON"></div>
\#toJSON `model.toJSON()`
-------------------------

Same as a [Backbone](http://backbonejs.org/#Model-toJSON), but `hasMany`
relationships are converted to JSON and put in an array under `relations_attributes`.
`hasOne` relationships are placed under `relation_attributes`.

<div id="Model-toParam"></div>
\#toParam `model.toParam()`
---------------------------

Returns a string representing the object's key suitable for use in URLs, or
`null` if `#isNew` is `true`.

<div id="Model-paramRoot"></div>
\#paramRoot `model.paramRoot()`
-----------------------------

Returns string to use for the root in json. This is the key attributes from the
model will be namespaced under when sending to the server.

<div id="Model-save"></div>
\#save `model.save(key, val, options)`
--------------------------------------

Same as [Backbone](http://backbonejs.org/#Model-save), but when a save fails with
a `HTTP 400 - Bad Request` the response is parsed to find `errors` in the json
and set the errors on the appropriate models. Also triggers the `invalid` event
with the arguments `model, errors, options`.

<div id="Model-sync"></div>
\#sync `model.sync(method, model, options)`
-------------------------------------------

Overrides [Backbone.Model#sync](http://backbonejs.org/#Model-sync) because
[Ruby on Rails](http://rubyonrails.org/) expects the attributes to be namespaced
under the `paramRoot`. Any model sync data will be placed under the `paramRoot`
key determined by the <code>[paramRoot](#Model-paramRoot)</code> function

<div id="Model-setErrors"></div>
\#setErrors `model.setErrors(errors, [options])`
------------------------------------------------

Set <code>[validationError](http://backbonejs.org/#Model-validationError)</code>
to `errors` and triggers a `invalid` event with the arguments `model, errors, options`.

<div id="Model-errorsOn"></div>
\#errorsOn `model.errorsOn(attribute)`
--------------------------------------

Returns the error on `attribute` if there is one, otherwise it returns `null`.

<div id="Model-coerceAttributes"></div>
\#coerceAttributes `model.coerceAttributes(attributes)`
-------------------------------------------------------

Coerces the attributes to the approriate model defined in the relationships
of the model. Mainly used by Viking.js.