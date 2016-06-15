export const defaults = function () {
    let dflts = {};

    if (typeof(this.schema) === 'undefined') {
        return dflts;
    }

    Object.keys(this.schema).forEach( (key) => {
        if (this.schema[key]['default']) {
            dflts[key] = this.schema[key]['default'];
        }
    });

    return dflts;
};
