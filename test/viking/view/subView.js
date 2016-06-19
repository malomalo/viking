import Viking from '../../../src/viking';

(function () {
    module("Viking.View.subView", {
        setup : function() {
            Object.keys(JST).forEach(function (key) {
                Viking.View.templates[key] = JST[key];
            });
        }
    });
    
    test("Initalization setups a new array for subView", function () {
        var view = new Viking.View();
        var view2 = new Viking.View();

        deepEqual(view.subViews, []);
        ok(view.subViews !== view2.subViews);
    });

    test("#subView", function () {
        var SubView = Viking.View.extend();
        
        var view = new Viking.View();
        var mysubview = view.subView(SubView);
        
        ok(_.contains(view.subViews, mysubview));
        ok(mysubview instanceof SubView);
    });
    
    test("#subView passes options to subView", function () {
        var SubView = Viking.View.extend({
            initialize: function (options) {
                deepEqual(options, {'my': 'options'});
            }
        });
        
        var view = new Viking.View();
        var mysubview = view.subView(SubView, {'my': 'options'});
    });
    
    test("#removeSubView", function () {
        expect(3);
        
        var view = new Viking.View();
        var mysubview = view.subView(Viking.View);
        
        mysubview.remove = function () { ok(true); } // Assert SubView.remove is called
        view.stopListening = function (obj) { strictEqual(obj, mysubview); } // Assert stops listening to view

        view.removeSubView(mysubview);
        
        ok(!_.contains(view.subViews, mysubview)); // Assert removed from array
    });
    
    test("#remove", function () {
        var view = new Viking.View();
        var mysubview = view.subView(Viking.View);
        
        mysubview.remove = function () { ok(true); } // Assert SubView.remove is called
        view.remove();
    });
    
    test("subview#remove() removes itself from the parent subViews", function () {
        var view = new Viking.View();
        var mysubview = view.subView(Viking.View);
        
        mysubview.remove();
        deepEqual([], view.subViews);
    });
    
}());
