import Viking from './../../../../../src/viking';

(function () {
    module("Viking.Model#coerceAttributes - belongsTo");

    test("#coerceAttributes initializes belongsTo relation with hash", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();

        var result = a.coerceAttributes({ship: {key: 'value'}});
        ok(result.ship instanceof Ship);
        deepEqual(result.ship.attributes, {key: 'value'});
    });

    test("#coerceAttributes initializes belongsTo relation with instance of model", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        var b = new Ship({key: 'value'});

        var result = a.coerceAttributes({ship: b});
        ok(result.ship === b);
    });

}());