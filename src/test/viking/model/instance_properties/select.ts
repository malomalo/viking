import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#select', {}, () => {

    test("#select() sets 'selected' to true on model when not in a collection", function() {
        var model = new Viking.Model({});
        model.select();
    
        assert.ok(model.selected);
    });
    
    test("#select() sets 'selected' to true on the model when in a collection", function() {
        var c = new Viking.Collection([{}, {}]);
        var model = c.models[0];
        model.select();
    
        assert.ok(model.selected);
    });

    test("#select() sets 'selected' to false other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        models[0].selected = true;
        models[1].selected = true;
        models[2].selected = true;
    
        assert.ok(models[0].selected);
        assert.ok(models[1].selected);
        assert.ok(models[2].selected);
    
        models[1].select();
    
        assert.ok(!models[0].selected);
        assert.ok(models[1].selected);
        assert.ok(!models[2].selected);
    });
    
    test("#select(true) selects the model", function () {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        
        assert.ok(!models[0].selected);
        models[0].select(true);
        assert.ok(models[0].selected);
    });
    
    test("#select(false) unselects the model", function () {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        
        models[0].select();
        
        assert.ok(models[0].selected);
        models[0].select(false);
        assert.ok(!models[0].selected);
    });

    test("#select({multiple: true}) doesn't unselect other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        models[0].select();
        models[1].select({multiple: true});
        models[2].select({multiple: true});
    
        assert.ok(models[0].selected);
        assert.ok(models[1].selected);
        assert.ok(models[2].selected);
    });

    test("#select() triggers a 'selected' event", function() {
        var c = new Viking.Collection([{}]);
        var model = c.models[0];

        model.on('selected', function() {
            assert.ok(model.selected);
        });
        model.select();
        model.off('selected');
    });
    
    test("#select() triggers a 'selected' event on the collection", function() {
        var c = new Viking.Collection([{}]);
        c.on('selected', function() {
            assert.ok(true);
        });
        c.models[0].select();
        c.off('selected');
        assert.ok(true);
    });

    test("#select() triggers a 'selected' event only if change", function() {
        var c = new Viking.Collection([{}]);
        var m = c.models[0];
		m.selected = true;
        m.on('selected', function() {
            assert.ok(false);
        });
        m.select();
        m.off('selected');
    });
    
    test("#select() triggers a 'selected' event on collection only if change", function() {
        var c = new Viking.Collection([{}]);
        c.models[0].selected = true;
        c.on('selected', function() {
            assert.ok(false);
        });
        c.models[0].select();
        c.off('selected');
        assert.ok(true);
    });

});