## 1.1.0 (June 24th, 2013)

New Features:

  - `Viking.Model`: added `#unselect` method
  - `Viking.Router`: added support for regex routes

Major Changes:

   - `Viking.Model`: `#select` now uses `model.select` instead of model attributes

Bugfixes:

  - `Viking.Model`: Better support in older browsers for parsing ISO8601 dates
  - `Viking.Router`: Delayed the loading of the route callback until `route` is
    called. Allows Controllers and functions to be be loaded after the router.
  - `Viking.PaginatedCollection`: if `offset` is not included in a paginated
    response it's ignored. it was causing the inital request to load twice.
	
## 1.0.0 (April 30th, 2013)

Inital Release!