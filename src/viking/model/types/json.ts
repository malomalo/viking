import * as _ from 'underscore';
import { Model } from '../../model';
import { Name } from '../../model/name';

export const JSONType = {
    load(value: any, key: string) {
        if (typeof value === 'object') {
            if (value instanceof Model) {
                value = value.attributes;
            }

            const AnonModel = Model.extend({
                inheritanceAttribute: false
            });

            const model = new AnonModel(value);
            model.modelName = new Name((key || '').toString());
            model.baseModel = model;
            _.each(value, (v, k: string) => {
                if (_.isObject(v) && !_.isArray(v) && !_.isDate(v)) {
                    const subModel = JSONType.load(v, k);
                    model.listenTo(subModel, 'change', () => {
                        model.trigger('change', arguments);
                    });
                    model.attributes[k] = subModel;
                }
            });

            return model;
        }
        throw new TypeError(typeof value + " can't be coerced into JSON");
    },

    dump(value) {
        if (value instanceof Model) {
            const output = value.toJSON();
            _.each(output, (v, k) => {
                if (v instanceof Model) {
                    output[k] = JSONType.dump(v);
                }
            });
            return output;
        }

        return value;
    }
};
