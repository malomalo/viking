Viking.NameError = function (message) {
  this.name = "Viking.NameError";
  this.message = message;
};

Viking.NameError.prototype = Error.prototype;