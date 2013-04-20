// strftime relies on https://github.com/samsonjs/strftime. It supports
// standard specifiers from C as well as some other extensions from Ruby.
Date.prototype.strftime = function(fmt) {
    return strftime(fmt, this);
};