import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model#unselect");
	
    test("#unselect() triggers a 'unselected' event", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        var model = c.models[0];
		model.selected = true;
        model.on('unselected', function() { ok(!model.selected); });
        model.unselect();
        model.off('unselected');
    });
    
    test("#unselect() triggers a 'unselected' event on collection", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
		c.models[0].selected = true;
        c.on('unselected', function() { ok(true); });
        c.models[0].unselect();
        c.off('unselected');
    });

    test("#unselect() triggers a 'selected' event only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
        var m = c.models[0];
        m.on('unselected', function() { ok(true); });
        m.unselect();
        m.off('unselected');
    });
    
    test("#unselect() triggers a 'unselected' event on collection only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
		c.models[0].selected = false;
        c.on('unselected', function() { ok(true); });
        c.models[0].unselect();
        c.off('unselected');
    });


}());