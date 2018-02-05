import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.HasOneReflection::new', {}, () => {

    test("::new('parent')", function() {
        let Parent = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('parent');
        
        assert.equal(assocation.name, 'parent');
        assert.equal(assocation.macro, 'hasOne');
        assert.deepEqual(assocation.options, {});
        assert.propEqual(_.omit(assocation.modelName, 'model'), {
            name: 'Parent',
            element: 'parent',
            human: 'Parent',
            paramKey: 'parent',
            plural: 'parents',
            routeKey: 'parents',
            singular: 'parent',
            collection: 'parents',
            collectionName: 'ParentCollection'
        });
    });
    
    test("::new('children', { modelName: 'Region'})", function() {
        let Region = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('parent', {modelName: 'Region'});
        
        assert.equal(assocation.name, 'parent');
        assert.equal(assocation.macro, 'hasOne');
        assert.deepEqual(assocation.options, {modelName: 'Region'});
        assert.propEqual(assocation.modelName, new Viking.Model.Name('Region'));
    });

    test("#klass", function() {
        let Child = Viking.Model.extend();
        let MultiWord = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('child');
        assert.equal(assocation.klass(), Child);
        
        var assocation = new Viking.Model.HasOneReflection('multi_word');
        assert.equal(assocation.klass(), MultiWord);
    });

});