import { global } from '../../global';
import Model from '../../model';
import Type from '../type';

export const coerceAttributes = function(attrs) {
    
    _.each(this.associations, function(association) {
        let Type;
        let polymorphic = association.options.polymorphic;
        
        if (!attrs[association.name]) { return; }
        
        if (polymorphic && (attrs[association.name] instanceof Model)) {
            // TODO: remove setting the id?
            attrs[association.name + '_id'] = attrs[association.name].id;
            attrs[association.name + '_type'] = attrs[association.name].modelName.name;
        } else if (polymorphic && attrs[association.name + '_type']) {
            Type = attrs[association.name + '_type'].camelize().constantize(global);
            attrs[association.name] = new Type(attrs[association.name]);
        } else if (!(attrs[association.name] instanceof association.klass())) {
            Type = association.klass();
            attrs[association.name] = new Type(attrs[association.name]);
        }
    });

    _.each(this.schema, function (options, key) {
        if (attrs[key] || attrs[key] === false) {
            let tmp, klass;
            
            klass = Type.registry[options['type']];
            if (klass) {
                if (options['array']) {
                    tmp = [];
                    _.each(attrs[key], function(value) {
                        tmp.push(klass.load(value, key));
                    });
                    attrs[key] = tmp;
                } else {
                    attrs[key] = klass.load(attrs[key], key);
                }
            } else {
                throw new TypeError("Coercion of " + options['type'] + " unsupported");
            }
        }
    });

    return attrs;
};