_.extend2 = function(obj) {
  _.each(Array.prototype.slice.call(arguments, 1), function(source) {
    if (source) {
      _.each(_.keys(source), function(prop) {
        obj[prop] = source[prop];
      });
    }
  });
  return obj;
};