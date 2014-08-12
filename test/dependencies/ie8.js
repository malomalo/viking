_.extend = function(obj) {
  _.each(Array.prototype.slice.call(arguments, 1), function(source) {
    if (source) {
      _.each(source, function(value, prop) {
        obj[prop] = value;
      });
    }
  });
  return obj;
};