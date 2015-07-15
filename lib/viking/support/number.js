// ordinalize returns the ordinal string corresponding to integer:
//
//     (1).ordinalize()    // => '1st'
//     (2).ordinalize()    // => '2nd'
//     (53).ordinalize()   // => '53rd'
//     (2009).ordinalize() // => '2009th'
//     (-134).ordinalize() // => '-134th'
Number.prototype.ordinalize = function() {
    var abs = Math.abs(this);
    
    if (abs % 100 >= 11 && abs % 100 <= 13) {
        return this + 'th';
    }
    
    abs = abs % 10;
    if (abs === 1) { return this + 'st'; }
    if (abs === 2) { return this + 'nd'; }
    if (abs === 3) { return this + 'rd'; }
    
    return this + 'th';
};

// Alias of to_s.
Number.prototype.toParam = Number.prototype.toString;

Number.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
};


Number.prototype.second = function() {
    return this * 1000;
};
Number.prototype.seconds = Number.prototype.second;

Number.prototype.minute = function() {
    return this * 60000;
};
Number.prototype.minutes = Number.prototype.minute;

Number.prototype.hour = function() {
    return this * 3600000;
};
Number.prototype.hours = Number.prototype.hour;

Number.prototype.day = function() {
    return this * 86400000;
};
Number.prototype.days = Number.prototype.day;

Number.prototype.week = function() {
    return this * 7 * 86400000;
};
Number.prototype.weeks = Number.prototype.week;


Number.prototype.ago = function() {
    return new Date((new Date()).getTime() - this);
};

Number.prototype.fromNow = function() {
    return new Date((new Date()).getTime() + this);
};
