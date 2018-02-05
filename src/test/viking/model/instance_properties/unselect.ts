import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#unselect', {}, () => {
	
    test("#unselect() triggers a 'unselected' event", function() {
        var c = new Viking.Collection([{}]);
        var model = c.models[0];
		model.selected = true;
        model.on('unselected', function() {
            assert.ok(!model.selected);
        });
        model.unselect();
        model.off('unselected');
    });
    
    test("#unselect() triggers a 'unselected' event on collection", function() {
        var c = new Viking.Collection([{}]);
		c.models[0].selected = true;
        c.on('unselected', function() {
            assert.ok(true);
        });
        c.models[0].unselect();
        c.off('unselected');
    });

    test("#unselect() triggers a 'selected' event only if change", function() {
        var c = new Viking.Collection([{}]);
        var m = c.models[0];
        m.on('unselected', function() {
            assert.ok(false);
        });
        m.unselect();
        m.off('unselected');
        assert.ok(true);
    });
    
    test("#unselect() triggers a 'unselected' event on collection only if change", function() {
        var c = new Viking.Collection([{}]);
		c.models[0].selected = false;
        c.on('unselected', function() {
            assert.ok(false);
        });
        c.models[0].unselect();
        c.off('unselected');
        assert.ok(true);
    });
});