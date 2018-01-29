import * as _ from 'underscore';
import { Model } from '../../model';
import { Name } from '../../model/name';

export const JSONType = {

    load: function (value: any, key: string) {
        if (typeof value === 'object' && !(value instanceof Model)) {
            var AnonModel = Model.extend({
                inheritanceAttribute: false
            });
            var model = new AnonModel(value);
            model.modelName = new Name(key);
            model.baseModel = model;
            _.each(value, function (v, k: string) {
                if (_.isObject(v) && !_.isArray(v) && !_.isDate(v)) {
                    var sub_model = JSONType.load(v, k)
                    model.listenTo(sub_model, 'change', function () {
                        model.trigger('change', arguments);
                    });
                    model.attributes[k] = sub_model;
                }
            });

            return model;
        }

        if (!(value instanceof Model)) {
            throw new TypeError(typeof value + " can't be coerced into JSON");
        }

        return value;
    },

    dump: function (value) {
        if (value instanceof Model) {
            var output = value.toJSON();
            _.each(output, function (v, k) {
                if (v instanceof Model) {
                    output[k] = JSONType.dump(v)
                }
            })
            return output;
        }

        return value;
    }

};
