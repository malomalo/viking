import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model#updateAttributes");

    test("#updateAttributes(data) calls #save", function() {
        expect(2)
        
        var model = new Viking.Model();
        model.save = function (data, options) {
            deepEqual(data, {key: 'value'});
            deepEqual(options, {patch: true});
        }
        
        model.updateAttributes({key: 'value'});
    });
    
    test("#updateAttributes(data, options) calls #save", function() {
        expect(2)
        
        var model = new Viking.Model();
        model.save = function (data, options) {
            deepEqual(data, {key: 'value'});
            deepEqual(options, {patch: true, option: 1});
        }
        
        model.updateAttributes({key: 'value'}, {option: 1});
    });

}());