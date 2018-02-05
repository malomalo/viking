import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Viking.View.subView', {
    beforeEach: function() {
        // TODO is this needed, if so need to figure out how to setup JST
        // Viking.View.templates = JST;
    }
}, () => {    
    test("Initalization setups a new array for subView", function () {
        var view = new Viking.View();
        var view2 = new Viking.View();

        assert.deepEqual(view.subViews, []);
        assert.ok(view.subViews !== view2.subViews);
    });

    test("#subView", function () {
        var SubView = Viking.View.extend();
        
        var view = new Viking.View();
        var mysubview = view.subView(SubView);
        
        assert.ok(_.contains(view.subViews, mysubview));
        assert.ok(mysubview instanceof SubView);
    });
    
    test("#subView passes options to subView", function () {
        var SubView = Viking.View.extend({
            initialize: function (options) {
                assert.deepEqual(options, {'my': 'options'});
            }
        });
        
        var view = new Viking.View();
        var mysubview = view.subView(SubView, {'my': 'options'});
    });
    
    test("#removeSubView", async () => {
        await new Promise((resolve) => {
        
            var view = new Viking.View();
            var mysubview = view.subView(Viking.View);
    
            mysubview.remove = function () {
                assert.ok(true);
            } // Assert SubView.remove is called
    
            view.stopListening = function (obj) {
                assert.strictEqual(obj, mysubview);
                resolve();
            } // Assert stops listening to view

            view.removeSubView(mysubview);
    
            assert.ok(!_.contains(view.subViews, mysubview)); // Assert removed from array
        });
    });
    
    test("#remove", function () {
        var view = new Viking.View();
        var mysubview = view.subView(Viking.View);
        
        mysubview.remove = function () { assert.ok(true); } // Assert SubView.remove is called
        view.remove();
    });
    
    test("subview#remove() removes itself from the parent subViews", function () {
        var view = new Viking.View();
        var mysubview = view.subView(Viking.View);
        
        mysubview.remove();
        assert.deepEqual([], view.subViews);
    });
    
});
