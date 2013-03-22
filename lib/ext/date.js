Date.prototype.strftime = function(fmt) {
    return strftime(fmt, this);
};

Date.prototype.strftimeUTC = function(fmt) {
    return strftimeUTC(fmt, this);
};