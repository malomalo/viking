Viking.NameError = function (message, file, lineNumber) {
    let err = new Error();

    if (err.stack) {
        // Remove one stack level.
        if (typeof(Components) != 'undefined') {
            // Mozilla
            this.stack = err.stack.substring(err.stack.indexOf('\n')+1);
        } else if (typeof(chrome) != 'undefined' || typeof(process) != 'undefined') {
            // Chrome / Node.js
            this.stack = err.stack.replace(/\n[^\n]*/,'');
        } else {
            this.stack = err.stack;
        }
    }

    this.name = 'Viking.NameError';
    this.message = message === undefined ? err.message : message;
    this.file = file === undefined ? err.file : file;
    this.lineNumber = lineNumber === undefined ? err.lineNumber : lineNumber;
};

Viking.NameError.prototype = Object.create(Error.prototype);
Viking.NameError.prototype.constructor = Viking.NameError;

Viking.ArgumentError = function (message, file, lineNumber) {
    let err = new Error();

    if (err.stack) {
        // Remove one stack level.
        if (typeof(Components) != 'undefined') {
            // Mozilla
            this.stack = err.stack.substring(err.stack.indexOf('\n')+1);
        } else if (typeof(chrome) != 'undefined' || typeof(process) != 'undefined') {
            // Chrome / Node.js
            this.stack = err.stack.replace(/\n[^\n]*/,'');
        } else {
            this.stack = err.stack;
        }
    }

    this.name = 'Viking.ArgumentError';
    this.message = message === undefined ? err.message : message;
    this.file = file === undefined ? err.file : file;
    this.lineNumber = lineNumber === undefined ? err.lineNumber : lineNumber;
};

Viking.ArgumentError.prototype = Object.create(Error.prototype);
Viking.ArgumentError.prototype.constructor = Viking.ArgumentError;
