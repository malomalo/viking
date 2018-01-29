export const BooleanType = {

    load: (value: string | boolean): boolean =>   {
        if (typeof value === 'string') {
            value = (value === 'true');
        }

        return !!value;
    },

    dump: (value: boolean): any => value

};
