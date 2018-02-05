import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.HasManyReflection', {}, () => {

    test("::new('children')", function() {
        let ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        
        assert.equal(assocation.name, 'children');
        assert.equal(assocation.macro, 'hasMany');
        assert.deepEqual(assocation.options, {});
        assert.equal(assocation.collectionName, 'ChildCollection');
    });
    
    test("::new('children', {collectionName: 'MyCollection'})", function() {
        let MyCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children', {collectionName: 'MyCollection'});
        
        assert.equal(assocation.name, 'children');
        assert.equal(assocation.macro, 'hasMany');
        assert.deepEqual(assocation.options, {collectionName: 'MyCollection'});
        assert.equal(assocation.collectionName, 'MyCollection');
    });
    
    test("::new('children', { modelName: 'Region' })", function() {
        let Region = Viking.Model.extend();
        let RegionCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children', { modelName: 'Region' });
        
        assert.equal(assocation.name, 'children');
        assert.equal(assocation.macro, 'hasMany');
        assert.deepEqual(assocation.options, { modelName: 'Region' });
        assert.equal(assocation.collectionName, 'RegionCollection');
    });

    test("#collection", function() {
        let ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        assert.equal(assocation.collection(), ChildCollection);
    });
    
    test("#klass", function() {
        let ChildCollection = Viking.Collection.extend();
        let MultiWordCollection = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        assert.equal(assocation.klass(), ChildCollection);
        
        var assocation = new Viking.Model.HasManyReflection('multi_words');
        assert.equal(assocation.klass(), MultiWordCollection);
    });

    
});