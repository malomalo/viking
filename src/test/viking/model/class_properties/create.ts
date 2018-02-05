import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Model::create', {
    beforeEach: function() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        xhr.restore();
    }
}, () => {
    test("::create returns an new model", function() {
        var Model = Viking.Model.extend('model');
        
        var m = Model.create({name: "name"});
        assert.ok(m instanceof Model);
    });

    test("::create calls save with options", function() {
        var Model = Viking.Model.extend('model');
        
        Model.prototype.save = function (attributes, options) {
            assert.deepEqual(options, {option: 1});
        };
        
        var m = Model.create({name: "name"}, {option: 1});
    });

});
