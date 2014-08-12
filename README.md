<a href="vikingjs.org">![Viking.js](/logo.jpg)</a>

## Installation <a href="https://semaphoreapp.com/projects/2007/branches/41585"><img style="float:right" src="https://semaphoreapp.com/api/v1/projects/de13df90eadbe3e26d246510c52c6003f89bc890/41585/badge.png"></a>&nbsp;[![Coverage Status](https://coveralls.io/repos/malomalo/viking/badge.png?branch=master)](https://coveralls.io/r/malomalo/viking)

Download the latest version here:

* [Viking.js](viking.js)

Viking's dependencies are listed below:

* [jQuery](http://jquery.com/) (>= 1.9.1)

* [Backbone.js](http://underscorejs.org/) (>= 1.0.0)

* [Underscore.js](http://underscorejs.org/) (>= 1.4.4)

* [Underscore.Inflector](https://github.com/jeremyruppel/underscore.inflection) (>= 1.0.0)

* [strftime](https://github.com/samsonjs/strftime)

    To Get `strftime` working in the browser I had to comment out lines #18-23,
    and #26.

## Building

Run `rake build` from the base directory. It will output `viking.js` in the root dir.

## Browser Compatibility
Tested and functional in Chrome 36+, Safari 7+, Firefox 29+

IE10 and below does not support STI

IE9 and below does not support Viking.Router because of pushstate

### IE8 Support
To use IE8 you'll need these dependencies:

* [ES5 Shim](https://github.com/kriskowal/es5-shim/)

* [ES5 Sham](https://github.com/kriskowal/es5-shim/)

* [JSON2](https://github.com/douglascrockford/JSON-js) (required be backbone.js for IE8 support)

* [Viking.IE8](test/dependencies/viking.ie8.js) (needs to be included after viking.js)
