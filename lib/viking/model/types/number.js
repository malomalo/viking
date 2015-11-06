Viking.Model.Type.registry['number'] = Viking.Model.Type.Number = {
    load: function(value) {
        if (typeof value === 'string') {
            value = value.replace(/\,/g, '');
			
			if (value.trim() === '') {
				return null;
			}
        }

        return Number(value);
    },

    dump: function(value) {
		return value;
    }
};
