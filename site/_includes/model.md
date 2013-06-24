Model
=====

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

::urlRoot `Model.urlRoot()`
---------------------------

Returns the URL of the collection.

{% highlight bash %}
var Note = Viking.Model.extend('note');

Note.urlRoot() // => "/notes"
{% endhighlight %}

::find `Model.find(id, options)`
-----------------------

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

\#constructor / #initialize `new Model([attributes], [options])`
----------------------------------------------------------------

Same as [Backbone](http://backbonejs.org/#Model-constructor), but
`{collection: ...}` is unnecessary to compute the mode's url if the model `name`
is defined when creating the model.


\#select `model.select([multiple])`
-----------------------------------

When the model is part of a collection and you want to select a single or
multiple items from a collection. If a model is selected `model.selected`
will be set `true`, otherwise it will be `false`.

By default any other models in the collection with be unselected. To prevent
other models in the collection from being unselected you can pass `true`.

The `selected` and `unselected` events are fired when appropriate.
