import * as support from '../support';


export function parseSearchParams(paramString) {
    const params = {};

    (new URLSearchParams(paramString)).forEach((value, key) => {
        let bury = params;
        const keys = key.split(/(?:\]\[|\[)/g);

        if (keys[0].at(-1) === '[') { 
            keys[0] = keys[0].slice(0, -1)
        }
        if (keys[keys.length-1].at(-1) === ']') { 
            keys[keys.length-1] = keys[keys.length-1].slice(0, -1)
        }

        while (keys.length > 1) {
            key = keys.shift();
            if (keys[0].length == 0) {
                if (bury[key]) {
                    bury = bury[key];
                } else {
                    bury[key] = [];
                    bury = bury[key];
                }
                keys.shift();
            } else {
                if (bury[key]) {
                    bury = bury[key];
                } else {
                    bury[key] = {};
                    bury = bury[key];
                }
            }
        }
        
        key = keys.shift();
        if (key.length === 0) {
            bury.push([value]);
        } else {
            if (Array.isArray(bury)) {
                bury.push({[key]: value});
            } else {
                bury[key] = value;
            }
        }
    });

    return params;
}