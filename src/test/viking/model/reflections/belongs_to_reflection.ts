import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.BelongsToReflection::new', {}, () => {

    test("::new('parent')", function () {
        let Parent = Viking.Model.extend();
        Viking.context['Parent'] = Parent;

        var assocation = new Viking.Model.BelongsToReflection('parent');

        assert.equal(assocation.name, 'parent');
        assert.equal(assocation.macro, 'belongsTo');
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
            collectionName: 'ParentCollection',
            title: 'Parent'
        });

        delete Viking.context['Parent'];
    });

    test("::new('children', { modelName: 'Region' })", function () {
        let Region = Viking.Model.extend();
        Viking.context['Region'] = Region;
        var assocation = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

        assert.equal(assocation.name, 'parent');
        assert.equal(assocation.macro, 'belongsTo');
        assert.deepEqual(assocation.options, { modelName: 'Region' });
        assert.deepEqual(assocation.modelName, new Viking.Model.Name('Region'));

        delete Viking.context['Region'];
    });

    test("::new('subject', {polymorphic: true})", function () {
        let Photo = Viking.Model.extend();
        Viking.context['Photo'] = Photo;
        var assocation = new Viking.Model.BelongsToReflection('subject', { polymorphic: true });
        assert.equal(assocation.macro, 'belongsTo');
        assert.equal(assocation.name, 'subject');
        assert.deepEqual(assocation.options, { polymorphic: true });
        assert.equal(assocation.modelName, undefined);

        delete Viking.context['Photo'];
    });

    test("#klass", function () {
        let Child = Viking.Model.extend();
        let MultiWord = Viking.Model.extend();

        Viking.context['Child'] = Child;
        Viking.context['MultiWord'] = MultiWord;

        var assocation = new Viking.Model.BelongsToReflection('child');
        assert.equal(assocation.klass(), Child);

        var assocation = new Viking.Model.BelongsToReflection('multi_word');
        assert.equal(assocation.klass(), MultiWord);

        delete Viking.context['Child'];
        delete Viking.context['MultiWord'];
    });

    test("#model", function () {
        let Child = Viking.Model.extend();

        Viking.context['Child'] = Child;

        var assocation = new Viking.Model.BelongsToReflection('child');
        assert.equal(assocation.model(), Child);

        delete Viking.context['Child'];
    });


});