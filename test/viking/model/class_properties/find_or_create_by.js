import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model::findOrCreateBy", {
        setup: function() {
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = _.bind(function(xhr) {
                this.requests.push(xhr);
            }, this);
        },
        teardown: function() {
            this.xhr.restore();
        }
    });

    test("::findOrCreateBy(attributes) find a model that exits", function () {
        expect(1);
        
        let Ship = Viking.Model.extend('ship');
        var relient = new Ship({name: 'Relient'});
        
        window.ShipCollection = Viking.Collection.extend({
            fetch: function (options) {
                options.success(new ShipCollection([relient]));
            }
        });
        
        Ship.findOrCreateBy({name: 'Relient'}, {
            success: function (model) {
                strictEqual(model, relient);
            }
        });
        
        delete window.ShipCollection;
    });
    
    test("::findOrCreateBy(attributes) without a success callback finds a model that exits", function () {
        expect(0);
        
        let Ship = Viking.Model.extend('ship');
        
        window.ShipCollection = Viking.Collection.extend({
            fetch: function (options) {
                options.success(new ShipCollection([{name: 'Relient'}]));
            }
        });
        
        Ship.findOrCreateBy({name: 'Relient'});
        
        delete window.ShipCollection;
    });
    
    test("::findOrCreateBy(attributes) calls create when the model doesn't exist", function () {
        expect(2);
        
        let Ship = Viking.Model.extend('ship');
        window.ShipCollection = Viking.Collection.extend({
            fetch: function (options) {
                options.success(new ShipCollection([]));
            }
        });
        
        Ship.create = function (attributes, options) {
            deepEqual(attributes, {name: 'Relient'});
            deepEqual(options, {option: 1});
        };
        
        Ship.findOrCreateBy({name: 'Relient'}, {option: 1});
        
        delete window.ShipCollection;
    });

}());