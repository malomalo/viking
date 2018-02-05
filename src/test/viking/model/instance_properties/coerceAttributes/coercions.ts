import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.Model#coerceAttributes - coercions', {}, () => {

    // coerceAttributes modifies the object passed in ----------------------------
    test("#coerceAttributes modifies the object passed in", function() {
        let Model = Viking.Model.extend({ schema: {
            date: { type: 'date'}
        }});
        var a = new Model();
        var attrs = {date: "2013-04-10T21:24:28+00:00"};
        a.coerceAttributes(attrs);
    
        assert.deepEqual(attrs, {date: new Date(1365629068000)});
        assert.equal(attrs.date.valueOf(), (new Date(1365629068000)).valueOf());
    });

    // coercions and unsupported data type ---------------------------------------
    test("#coerceAttributes thows error when can't coerce value", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'Unkown'}
        }});
        var a = new Model();

        assert.throws(function() { a.coerceAttributes({date: true}) }, TypeError);

        try {
            a.coerceAttributes({date: true})
        } catch (e) {
            assert.equal(e.message, "Coercion of Unkown unsupported");
        }
    });

    // coercing dates ---------------------------------------------------------
    test("#coerceAttributes coerces iso8601 string to date", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        }});
        var a = new Model();
    
        assert.deepEqual(
            a.coerceAttributes({date: "2013-04-10T21:24:28+00:00"}),
            {date: new Date(1365629068000)}
        );
        assert.equal(a.coerceAttributes({date: "2013-04-10T21:24:28+00:00"}).date.valueOf(), (new Date(1365629068000)).valueOf());
    });

    test("#coerceAttributes coerces int(milliseconds since epoch) to date", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        }});
        var a = new Model();
    
        assert.deepEqual(
            a.coerceAttributes({date: 1365629126097}),
            {date: new Date(1365629126097)}
        );
        assert.equal(a.coerceAttributes({date: 1365629126097}).date.valueOf(), (new Date(1365629126097)).valueOf());
    });
    
    // coercing strings -------------------------------------------------------
    test("#coerceAttributes coerces boolean to string", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'string'}
        }});
        var a = new Model();
    
        assert.equal(a.coerceAttributes({key: true}).key, 'true');
        assert.equal(a.coerceAttributes({key: false}).key, 'false');
    });
    
    test("#coerceAttributes coerces number to string", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'string'}
        }});
        var a = new Model();
    
        assert.equal(a.coerceAttributes({key: 10}).key, '10');
        assert.equal(a.coerceAttributes({key: 10.5}).key, '10.5');
    });
    
    test("#coerceAttributes coerces null to string", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'string'}
        }});
        var a = new Model();
    
        assert.equal(a.coerceAttributes({key: null}).key, null);
    });
    
    // coercing numbers -------------------------------------------------------
    test("#coerceAttributes coerces string to number", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'number'}
        }});
        var a = new Model();
    
        assert.equal(a.coerceAttributes({key: '10.5'}).key, 10.50);
        assert.equal(a.coerceAttributes({key: '10'}).key, 10);
    });

    // coercing JSON ----------------------------------------------------------
    test("#coerceAttributes coerces {} to Viking.Model", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'json'}
        }});
        var a = new Model();

        assert.ok(a.coerceAttributes({key: {}}).key instanceof Viking.Model);
        assert.deepEqual(a.coerceAttributes({key: {}}).key.attributes, {});
        assert.deepEqual(a.coerceAttributes({key: {key: 'value'}}).key.attributes, {key: 'value'});
    });

    test("#coerceAttributes coerces {} to Viking.Model and sets the modelName", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'json'}
        }});
        var a = new Model();

        assert.deepEqual(a.coerceAttributes({key: {}}).key.modelName, 'key');
    });


    test("#coerceAttributes thows error when can't coerce value", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        }});
        var a = new Model();

        assert.throws(function() { a.coerceAttributes({date: true}) }, TypeError);

        try {
            a.coerceAttributes({date: true})
        } catch (e) {
            assert.equal(e.message, "boolean can't be coerced into Date");
        }
    });
    
    // Array support
    test("#coerceAttributes support array coercion", function() {
        let Model = Viking.Model.extend({ schema: {
            key: {type: 'number', array: true}
        }});
        var a = new Model();
        
        assert.deepEqual(a.coerceAttributes({key: [10, '10.5']}).key, [10, 10.5]);
        assert.deepEqual(a.coerceAttributes({key: ['10.5']}).key, [10.50]);
    });
    
});