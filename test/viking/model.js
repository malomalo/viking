import Viking from '../../src/viking';

(function() {
    module("Viking.Model");

    test("instance.modelName is set on instantiation", function() {
        let model = new (Viking.Model.extend('model'))();

        propEqual(_.omit(model.modelName, 'model'), {
            name: 'Model',
            element: 'model',
            human: 'Model',
            paramKey: 'model',
            plural: 'models',
            routeKey: 'models',
            singular: 'model',
            collection: 'models',
            collectionName: 'ModelCollection'
        });
    });

    test("::where() returns ModelCollection without a predicate", function() {
        let Ship = Viking.Model.extend('ship');
        let ShipCollection = Viking.Collection.extend({ model: Ship });

        let scope = Ship.where();
        ok(scope instanceof ShipCollection);
        strictEqual(undefined, scope.predicate);
    });

    test("::where(predicate) returns ModelCollection with a predicate set", function() {
        let Ship = Viking.Model.extend('ship');
        let ShipCollection = Viking.Collection.extend({ model: Ship });

        let scope = Ship.where({name: 'Zoey'});
        ok(scope instanceof ShipCollection);
        deepEqual({name: 'Zoey'}, scope.predicate.attributes);
    });
}());

import './model/defaults';
import './model/types/boolean';
import './model/types/date';
import './model/types/json';
import './model/types/number';
import './model/types/string';
import './model/class_properties/base_model';
import './model/class_properties/create';
import './model/class_properties/extend';
import './model/class_properties/find_or_create_by';
import './model/class_properties/find';
import './model/class_properties/inheritance_attribute';
import './model/class_properties/new';
import './model/class_properties/reflect_on_association';
import './model/class_properties/reflect_on_associations';
import './model/class_properties/urlRoot';
import './model/instance_properties/base_model';
import './model/instance_properties/coerceAttributes/belongsTo';
import './model/instance_properties/coerceAttributes/coercions';
import './model/instance_properties/coerceAttributes/hasMany';
import './model/instance_properties/inheritance_attribute';
import './model/instance_properties/paramRoot';
import './model/instance_properties/reflect_on_association';
import './model/instance_properties/reflect_on_associations';
import './model/instance_properties/save';
import './model/instance_properties/select';
import './model/instance_properties/set/belongsTo';
import './model/instance_properties/set/coercions';
import './model/instance_properties/set/hasMany';
import './model/instance_properties/set';
import './model/instance_properties/setErrors';
import './model/instance_properties/sync';
import './model/instance_properties/toJSON';
import './model/instance_properties/toJSON/belongsTo';
import './model/instance_properties/toJSON/hasMany';
import './model/instance_properties/toParam';
import './model/instance_properties/touch';
import './model/instance_properties/unselect';
import './model/instance_properties/unset/hasMany';
import './model/instance_properties/update_attribute';
import './model/instance_properties/update_attributes';
import './model/instance_properties/url';
import './model/instance_properties/urlRoot';