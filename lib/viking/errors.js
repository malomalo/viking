const NameError = function (message, file, lineNumber) {
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

NameError.prototype = Object.create(Error.prototype);
NameError.prototype.constructor = NameError;

const ArgumentError = function (message, file, lineNumber) {
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

ArgumentError.prototype = Object.create(Error.prototype);
ArgumentError.prototype.constructor = ArgumentError;

export NameError, ArgumentError