## 1.1.0 (June 24th, 2013)

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
	
## 1.0.0 (April 30th, 2013)

Inital Release!
