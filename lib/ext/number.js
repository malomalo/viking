Number.prototype.ordinalize = function() {
    var abs = Math.abs(this);
    if(abs % 100 >= 11 && abs % 100 <= 13) {
        return this + 'th';
    } else {
        abs = abs % 10;
        if(abs == 1) {
            return this + 'st';
        } else if (abs == 2) {
            return this + 'nd';
        } else if (abs == 3) {
            return this + 'rd';
        } else {
            return this + 'th';
        }
    }
};