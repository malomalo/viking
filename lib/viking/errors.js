Viking.NameError = function (message) {
  this.name = "Viking.NameError";
  this.message = message;
};

Viking.NameError.prototype = Error.prototype;

Viking.ArgumentError = function (message) {
  this.name = "Viking.ArgumentError";
  this.message = message ? message : 'Insufficient arguments';
};

Viking.ArgumentError.prototype = Error.prototype;
