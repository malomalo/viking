export default {

    // load: (value: string | boolean): boolean =>
    load: (value) => {
        if (typeof value === 'string') {
            value = (value === 'true');
        }

        return !!value;
    },

    // dump: (value: boolean): any => value
    dump: (value) => value

};
