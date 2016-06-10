// strftime relies on https://github.com/samsonjs/strftime. It supports
// standard specifiers from C as well as some other extensions from Ruby.
Date.prototype.strftime = function(format: string) {
    return strftime(format, this);
};

Date.fromISO = (s) => new Date(s);

// Alias of to_s.
Date.prototype.toParam = Date.prototype.toJSON;

Date.prototype.toQuery = function(key) {
    return escape(key.toParam()) + "=" + escape(this.toParam());
};

Date.prototype.today = () => new Date();

Date.prototype.isToday = function() {
    return (this.getUTCFullYear() === (new Date()).getUTCFullYear() && this.getUTCMonth() === (new Date()).getUTCMonth() && this.getUTCDate() === (new Date()).getUTCDate());
};

Date.prototype.isThisMonth = function () {
    return (this.getUTCFullYear() === (new Date()).getUTCFullYear() && this.getUTCMonth() === (new Date()).getUTCMonth());
}

Date.prototype.isThisYear = function() {
    return (this.getUTCFullYear() === (new Date()).getUTCFullYear());
};


Date.prototype.past = function () {
    return (this < (new Date()));
}