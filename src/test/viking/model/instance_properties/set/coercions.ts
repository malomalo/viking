import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.Model#set - coercions', {}, () => {

    test("#set(key, val) does coercions", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        }});
    
        var a = new Model();
        a.set('date', "2013-04-10T21:24:28+00:00");
        assert.equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    });

    test("#set({key, val}) does coercions", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        }});
    
        var a = new Model();
        a.set({date: "2013-04-10T21:24:28+00:00"});
        assert.equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    });

});