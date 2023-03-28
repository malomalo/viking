import * as assert from 'assert';
import Model from '@malomalo/viking/record';

describe('Viking.Record', () => {

    // before: () => {
    //     Viking.View.templates = window['JST'];
    // }
    
    class Actor extends Model {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            age: {type: "integer"},
            union: {type: "boolean"},
            preferences: {type: "json"}
        }
    }

    describe('clone', () => {
        it('clone', () => {
          let a = new Model({foo: 1, bar: 2, baz: 3});
          let b = a.clone();

          assert.equal(a.readAttribute('foo'), 1);
          assert.equal(a.readAttribute('bar'), 2);
          assert.equal(a.readAttribute('baz'), 3);
          assert.equal(b.readAttribute('foo'), a.readAttribute('foo'), 'Foo should be the same on the clone.');
          assert.equal(b.readAttribute('bar'), a.readAttribute('bar'), 'Bar should be the same on the clone.');
          assert.equal(b.readAttribute('baz'), a.readAttribute('baz'), 'Baz should be the same on the clone.');
          a.setAttributes({foo: 100});
          assert.equal(a.readAttribute('foo'), 100);
          assert.equal(b.readAttribute('foo'), 1, 'Changing a parent attribute does not change the clone.');
        });
        
        it('changes', () => {
            let a = new Model({foo: 1, bar: 2, baz: 3});
            a.persist();
            let b = a.clone();
            
            a.setAttributes({foo: 100});
            assert.deepEqual({foo: [1, 100]}, a.changes())
            assert.deepEqual({}, b.changes())
        })
        
        it('json type', () => {
            let a = new Actor({preferences: {fruit: 'apple'}});
            let b = a.clone();
            a.preferences.fruit = 'banana'
            assert.equal(b.preferences.fruit, 'apple')
        })
    })

    it('readAttribute', () => {
        let doc = new Model({title: 'The Tempest', author: 'Bill Shakespeare'});
        assert.equal(doc.readAttribute('title'), 'The Tempest');
        assert.equal(doc.readAttribute('author'), 'Bill Shakespeare');
    });
    
    // it('nested set triggers with the correct options', () => {
    //   let model = new Model();
    //   let o1 = {};
    //   let o2 = {};
    //   let o3 = {};
    //   model.addEventListener('change', (__, options) => {
    //     switch (model.readAttribute('a')) {
    //       case 1:
    //         assert.strictEqual(options, o1);
    //         return model.setAttributes('a', 2, o2);
    //       case 2:
    //         assert.strictEqual(options, o2);
    //         return model.setAttributes('a', 3, o3);
    //       case 3:
    //         assert.strictEqual(options, o3);
    //     }
    //   });
    //   model.setAttributes('a', 1, o1);
    // });
  
    // it('multiple unsets', () => {
    //   assert.expect(1);
    //   var i = 0;
    //   var counter = function(){ i++; };
    //   var model = new Backbone.Model({a: 1});
    //   model.on('change:a', counter);
    //   model.set({a: 2});
    //   model.unset('a');
    //   model.unset('a');
    //   assert.equal(i, 2, 'Unset does not fire an event for missing attributes.');
    // });
  
    it('using a non-default id attribute.', () => {
        class MyModel extends Model {
            static primaryKey = '_id';
        }
        let model = new MyModel({id: 'eye-dee', _id: 25, title: 'Model'});
        assert.equal(model.readAttribute('id'), 'eye-dee');
        assert.equal(model.readAttribute('_id'), 25);
        // assert.equal(model.id, 25);
        // assert.equal(model.isNew(), false);
        // model.unset('_id');
        // assert.equal(model.id, undefined);
        // assert.equal(model.isNew(), true);
    });
  
    it('setting an alternative cid prefix', () => {
      class MyModel extends Model {
        static cidPrefix = 'a';
      }

      let model = new Model();
      assert.equal(model.cid.charAt(0), 'm');

      model = new MyModel();
      assert.equal(model.cid.charAt(0), 'a');
    });

    // it('change with options', () => {
    //   assert.expect(2);
    //   var value;
    //   var model = new Backbone.Model({name: 'Rob'});
    //   model.on('change', function(m, options) {
    //     value = options.prefix + m.get('name');
    //   });
    //   model.set({name: 'Bob'}, {prefix: 'Mr. '});
    //   assert.equal(value, 'Mr. Bob');
    //   model.set({name: 'Sue'}, {prefix: 'Ms. '});
    //   assert.equal(value, 'Ms. Sue');
    // });
  
    // it('change after initialize', () => {
    //   assert.expect(1);
    //   var changed = 0;
    //   var attrs = {id: 1, label: 'c'};
    //   var obj = new Backbone.Model(attrs);
    //   obj.on('change', function() { changed += 1; });
    //   obj.set(attrs);
    //   assert.equal(changed, 0);
    // });
  
    // it('save within change event', () => {
    //   assert.expect(1);
    //   var env = this;
    //   var model = new Backbone.Model({firstName: 'Taylor', lastName: 'Swift'});
    //   model.url = '/test';
    //   model.on('change', function() {
    //     model.save();
    //     assert.ok(_.isEqual(env.syncArgs.model, model));
    //   });
    //   model.set({lastName: 'Hicks'});
    // });
  
    // it('validate after save', () => {
    //   assert.expect(2);
    //   var lastError, model = new Backbone.Model();
    //   model.validate = function(attrs) {
    //     if (attrs.admin) return "Can't change admin status.";
    //   };
    //   model.sync = function(method, m, options) {
    //     options.success.call(this, {admin: true});
    //   };
    //   model.on('invalid', function(m, error) {
    //     lastError = error;
    //   });
    //   model.save(null);
  
    //   assert.equal(lastError, "Can't change admin status.");
    //   assert.equal(model.validationError, "Can't change admin status.");
    // });
  
    // it('save', () => {
    //   assert.expect(2);
    //   doc.save({title: 'Henry V'});
    //   assert.equal(this.syncArgs.method, 'update');
    //   assert.ok(_.isEqual(this.syncArgs.model, doc));
    // });
  
    // it('save, fetch, destroy triggers error event when an error occurs', () => {
    //   assert.expect(3);
    //   var model = new Backbone.Model();
    //   model.on('error', function() {
    //     assert.ok(true);
    //   });
    //   model.sync = function(method, m, options) {
    //     options.error();
    //   };
    //   model.save({data: 2, id: 1});
    //   model.fetch();
    //   model.destroy();
    // });
  
    // it('#3283 - save, fetch, destroy calls success with context', () => {
    //   assert.expect(3);
    //   var model = new Backbone.Model();
    //   var obj = {};
    //   var options = {
    //     context: obj,
    //     success: function() {
    //       assert.equal(this, obj);
    //     }
    //   };
    //   model.sync = function(method, m, opts) {
    //     opts.success.call(opts.context);
    //   };
    //   model.save({data: 2, id: 1}, options);
    //   model.fetch(options);
    //   model.destroy(options);
    // });
  
    // it('#3283 - save, fetch, destroy calls error with context', () => {
    //   assert.expect(3);
    //   var model = new Backbone.Model();
    //   var obj = {};
    //   var options = {
    //     context: obj,
    //     error: function() {
    //       assert.equal(this, obj);
    //     }
    //   };
    //   model.sync = function(method, m, opts) {
    //     opts.error.call(opts.context);
    //   };
    //   model.save({data: 2, id: 1}, options);
    //   model.fetch(options);
    //   model.destroy(options);
    // });
  
    // it('#3470 - save and fetch with parse false', () => {
    //   assert.expect(2);
    //   var i = 0;
    //   var model = new Backbone.Model();
    //   model.parse = function() {
    //     assert.ok(false);
    //   };
    //   model.sync = function(method, m, options) {
    //     options.success({i: ++i});
    //   };
    //   model.fetch({parse: false});
    //   assert.equal(model.get('i'), i);
    //   model.save(null, {parse: false});
    //   assert.equal(model.get('i'), i);
    // });
  
    // it('save with PATCH', () => {
    //   doc.clear().set({id: 1, a: 1, b: 2, c: 3, d: 4});
    //   doc.save();
    //   assert.equal(this.syncArgs.method, 'update');
    //   assert.equal(this.syncArgs.options.attrs, undefined);
  
    //   doc.save({b: 2, d: 4}, {patch: true});
    //   assert.equal(this.syncArgs.method, 'patch');
    //   assert.equal(_.size(this.syncArgs.options.attrs), 2);
    //   assert.equal(this.syncArgs.options.attrs.d, 4);
    //   assert.equal(this.syncArgs.options.attrs.a, undefined);
    //   assert.equal(this.ajaxSettings.data, '{"b":2,"d":4}');
    // });
  
    // it('save with PATCH and different attrs', () => {
    //   doc.clear().save({b: 2, d: 4}, {patch: true, attrs: {B: 1, D: 3}});
    //   assert.equal(this.syncArgs.options.attrs.D, 3);
    //   assert.equal(this.syncArgs.options.attrs.d, undefined);
    //   assert.equal(this.ajaxSettings.data, '{"B":1,"D":3}');
    //   assert.deepEqual(doc.attributes, {b: 2, d: 4});
    // });
  
    // it('save in positional style', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.sync = function(method, m, options) {
    //     options.success();
    //   };
    //   model.save('title', 'Twelfth Night');
    //   assert.equal(model.get('title'), 'Twelfth Night');
    // });
  
    // it('save with non-object success response', () => {
    //   assert.expect(2);
    //   var model = new Backbone.Model();
    //   model.sync = function(method, m, options) {
    //     options.success('', options);
    //     options.success(null, options);
    //   };
    //   model.save({testing: 'empty'}, {
    //     success: function(m) {
    //       assert.deepEqual(m.attributes, {testing: 'empty'});
    //     }
    //   });
    // });
  
    // it('save with wait and supplied id', () => {
    //   var Model = Backbone.Model.extend({
    //     urlRoot: '/collection'
    //   });
    //   var model = new Model();
    //   model.save({id: 42}, {wait: true});
    //   assert.equal(this.ajaxSettings.url, '/collection/42');
    // });
  
    // it('save will pass extra options to success callback', () => {
    //   assert.expect(1);
    //   var SpecialSyncModel = Backbone.Model.extend({
    //     sync: function(method, m, options) {
    //       _.extend(options, {specialSync: true});
    //       return Backbone.Model.prototype.sync.call(this, method, m, options);
    //     },
    //     urlRoot: '/test'
    //   });
  
    //   var model = new SpecialSyncModel();
  
    //   var onSuccess = function(m, response, options) {
    //     assert.ok(options.specialSync, 'Options were passed correctly to callback');
    //   };
  
    //   model.save(null, {success: onSuccess});
    //   this.ajaxSettings.success();
    // });
  
    // it('fetch', () => {
    //   assert.expect(2);
    //   doc.fetch();
    //   assert.equal(this.syncArgs.method, 'read');
    //   assert.ok(_.isEqual(this.syncArgs.model, doc));
    // });
  
    // it('fetch will pass extra options to success callback', () => {
    //   assert.expect(1);
    //   var SpecialSyncModel = Backbone.Model.extend({
    //     sync: function(method, m, options) {
    //       _.extend(options, {specialSync: true});
    //       return Backbone.Model.prototype.sync.call(this, method, m, options);
    //     },
    //     urlRoot: '/test'
    //   });
  
    //   var model = new SpecialSyncModel();
  
    //   var onSuccess = function(m, response, options) {
    //     assert.ok(options.specialSync, 'Options were passed correctly to callback');
    //   };
  
    //   model.fetch({success: onSuccess});
    //   this.ajaxSettings.success();
    // });
  
    // it('destroy', () => {
    //   assert.expect(3);
    //   doc.destroy();
    //   assert.equal(this.syncArgs.method, 'delete');
    //   assert.ok(_.isEqual(this.syncArgs.model, doc));
  
    //   var newModel = new Backbone.Model;
    //   assert.equal(newModel.destroy(), false);
    // });
  
    // it('destroy will pass extra options to success callback', () => {
    //   assert.expect(1);
    //   var SpecialSyncModel = Backbone.Model.extend({
    //     sync: function(method, m, options) {
    //       _.extend(options, {specialSync: true});
    //       return Backbone.Model.prototype.sync.call(this, method, m, options);
    //     },
    //     urlRoot: '/test'
    //   });
  
    //   var model = new SpecialSyncModel({id: 'id'});
  
    //   var onSuccess = function(m, response, options) {
    //     assert.ok(options.specialSync, 'Options were passed correctly to callback');
    //   };
  
    //   model.destroy({success: onSuccess});
    //   this.ajaxSettings.success();
    // });
  
    // it('non-persisted destroy', () => {
    //   assert.expect(1);
    //   var a = new Backbone.Model({foo: 1, bar: 2, baz: 3});
    //   a.sync = function() { throw 'should not be called'; };
    //   a.destroy();
    //   assert.ok(true, 'non-persisted model should not call sync');
    // });
  
    // it('validate', () => {
    //   var lastError;
    //   var model = new Backbone.Model();
    //   model.validate = function(attrs) {
    //     if (attrs.admin !== this.get('admin')) return "Can't change admin status.";
    //   };
    //   model.on('invalid', function(m, error) {
    //     lastError = error;
    //   });
    //   var result = model.set({a: 100});
    //   assert.equal(result, model);
    //   assert.equal(model.get('a'), 100);
    //   assert.equal(lastError, undefined);
    //   result = model.set({admin: true});
    //   assert.equal(model.get('admin'), true);
    //   result = model.set({a: 200, admin: false}, {validate: true});
    //   assert.equal(lastError, "Can't change admin status.");
    //   assert.equal(result, false);
    //   assert.equal(model.get('a'), 100);
    // });
  
    // it('validate on unset and clear', () => {
    //   assert.expect(6);
    //   var error;
    //   var model = new Backbone.Model({name: 'One'});
    //   model.validate = function(attrs) {
    //     if (!attrs.name) {
    //       error = true;
    //       return 'No thanks.';
    //     }
    //   };
    //   model.set({name: 'Two'});
    //   assert.equal(model.get('name'), 'Two');
    //   assert.equal(error, undefined);
    //   model.unset('name', {validate: true});
    //   assert.equal(error, true);
    //   assert.equal(model.get('name'), 'Two');
    //   model.clear({validate: true});
    //   assert.equal(model.get('name'), 'Two');
    //   delete model.validate;
    //   model.clear();
    //   assert.equal(model.get('name'), undefined);
    // });
  
    // it('validate with error callback', () => {
    //   assert.expect(8);
    //   var lastError, boundError;
    //   var model = new Backbone.Model();
    //   model.validate = function(attrs) {
    //     if (attrs.admin) return "Can't change admin status.";
    //   };
    //   model.on('invalid', function(m, error) {
    //     boundError = true;
    //   });
    //   var result = model.set({a: 100}, {validate: true});
    //   assert.equal(result, model);
    //   assert.equal(model.get('a'), 100);
    //   assert.equal(model.validationError, null);
    //   assert.equal(boundError, undefined);
    //   result = model.set({a: 200, admin: true}, {validate: true});
    //   assert.equal(result, false);
    //   assert.equal(model.get('a'), 100);
    //   assert.equal(model.validationError, "Can't change admin status.");
    //   assert.equal(boundError, true);
    // });

    // it('Inherit class properties', () => {
    //   assert.expect(6);
    //   var Parent = Backbone.Model.extend({
    //     instancePropSame: function() {},
    //     instancePropDiff: function() {}
    //   }, {
    //     classProp: function() {}
    //   });
    //   var Child = Parent.extend({
    //     instancePropDiff: function() {}
    //   });
  
    //   var adult = new Parent;
    //   var kid   = new Child;
  
    //   assert.equal(Child.classProp, Parent.classProp);
    //   assert.notEqual(Child.classProp, undefined);
  
    //   assert.equal(kid.instancePropSame, adult.instancePropSame);
    //   assert.notEqual(kid.instancePropSame, undefined);
  
    //   assert.notEqual(Child.prototype.instancePropDiff, Parent.prototype.instancePropDiff);
    //   assert.notEqual(Child.prototype.instancePropDiff, undefined);
    // });
  
    // it("Nested change events don't clobber previous attributes", () => {
    //   assert.expect(4);
    //   new Backbone.Model()
    //   .on('change:state', function(m, newState) {
    //     assert.equal(m.previous('state'), undefined);
    //     assert.equal(newState, 'hello');
    //     // Fire a nested change event.
    //     m.set({other: 'whatever'});
    //   })
    //   .on('change:state', function(m, newState) {
    //     assert.equal(m.previous('state'), undefined);
    //     assert.equal(newState, 'hello');
    //   })
    //   .set({state: 'hello'});
    // });
  
    // it('hasChanged/set should use same comparison', () => {
    //   assert.expect(2);
    //   var changed = 0, model = new Backbone.Model({a: null});
    //   model.on('change', function() {
    //     assert.ok(this.hasChanged('a'));
    //   })
    //   .on('change:a', function() {
    //     changed++;
    //   })
    //   .set({a: undefined});
    //   assert.equal(changed, 1);
    // });
  
    // it('#582, #425, change:attribute callbacks should fire after all changes have occurred', () => {
    //   assert.expect(9);
    //   var model = new Backbone.Model;
  
    //   var assertion = function() {
    //     assert.equal(model.get('a'), 'a');
    //     assert.equal(model.get('b'), 'b');
    //     assert.equal(model.get('c'), 'c');
    //   };
  
    //   model.on('change:a', assertion);
    //   model.on('change:b', assertion);
    //   model.on('change:c', assertion);
  
    //   model.set({a: 'a', b: 'b', c: 'c'});
    // });
  
    // it('#871, set with attributes property', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.set({attributes: true});
    //   assert.ok(model.has('attributes'));
    // });
  
    // it('set value regardless of equality/change', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model({x: []});
    //   var a = [];
    //   model.set({x: a});
    //   assert.ok(model.get('x') === a);
    // });
  
    // it('set same value does not trigger change', () => {
    //   assert.expect(0);
    //   var model = new Backbone.Model({x: 1});
    //   model.on('change change:x', function() { assert.ok(false); });
    //   model.set({x: 1});
    //   model.set({x: 1});
    // });
  
    // it('unset does not fire a change for undefined attributes', () => {
    //   assert.expect(0);
    //   var model = new Backbone.Model({x: undefined});
    //   model.on('change:x', function(){ assert.ok(false); });
    //   model.unset('x');
    // });
  
    // it('set: undefined values', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model({x: undefined});
    //   assert.ok('x' in model.attributes);
    // });
  
    // it('hasChanged works outside of change events, and true within', () => {
    //   assert.expect(6);
    //   var model = new Backbone.Model({x: 1});
    //   model.on('change:x', function() {
    //     assert.ok(model.hasChanged('x'));
    //     assert.equal(model.get('x'), 1);
    //   });
    //   model.set({x: 2}, {silent: true});
    //   assert.ok(model.hasChanged());
    //   assert.equal(model.hasChanged('x'), true);
    //   model.set({x: 1});
    //   assert.ok(model.hasChanged());
    //   assert.equal(model.hasChanged('x'), true);
    // });
  
    // it('hasChanged gets cleared on the following set', () => {
    //   assert.expect(4);
    //   var model = new Backbone.Model;
    //   model.set({x: 1});
    //   assert.ok(model.hasChanged());
    //   model.set({x: 1});
    //   assert.ok(!model.hasChanged());
    //   model.set({x: 2});
    //   assert.ok(model.hasChanged());
    //   model.set({});
    //   assert.ok(!model.hasChanged());
    // });
  
    // it('save with `wait` succeeds without `validate`', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.url = '/test';
    //   model.save({x: 1}, {wait: true});
    //   assert.ok(this.syncArgs.model === model);
    // });
  
    // it("save without `wait` doesn't set invalid attributes", () => {
    //   var model = new Backbone.Model();
    //   model.validate = function() { return 1; };
    //   model.save({a: 1});
    //   assert.equal(model.get('a'), void 0);
    // });
  
    // it("save doesn't validate twice", () => {
    //   var model = new Backbone.Model();
    //   var times = 0;
    //   model.sync = function() {};
    //   model.validate = function() { ++times; };
    //   model.save({});
    //   assert.equal(times, 1);
    // });
  
    // it('`hasChanged` for falsey keys', () => {
    //   assert.expect(2);
    //   var model = new Backbone.Model();
    //   model.set({x: true}, {silent: true});
    //   assert.ok(!model.hasChanged(0));
    //   assert.ok(!model.hasChanged(''));
    // });
  
    // it('`previous` for falsey keys', () => {
    //   assert.expect(2);
    //   var model = new Backbone.Model({'0': true, '': true});
    //   model.set({'0': false, '': false}, {silent: true});
    //   assert.equal(model.previous(0), true);
    //   assert.equal(model.previous(''), true);
    // });
  
    // it('`save` with `wait` sends correct attributes', () => {
    //   assert.expect(5);
    //   var changed = 0;
    //   var model = new Backbone.Model({x: 1, y: 2});
    //   model.url = '/test';
    //   model.on('change:x', function() { changed++; });
    //   model.save({x: 3}, {wait: true});
    //   assert.deepEqual(JSON.parse(this.ajaxSettings.data), {x: 3, y: 2});
    //   assert.equal(model.get('x'), 1);
    //   assert.equal(changed, 0);
    //   this.syncArgs.options.success({});
    //   assert.equal(model.get('x'), 3);
    //   assert.equal(changed, 1);
    // });
  
    // it("a failed `save` with `wait` doesn't leave attributes behind", () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model;
    //   model.url = '/test';
    //   model.save({x: 1}, {wait: true});
    //   assert.equal(model.get('x'), void 0);
    // });
  
    // it('#1030 - `save` with `wait` results in correct attributes if success is called during sync', () => {
    //   assert.expect(2);
    //   var model = new Backbone.Model({x: 1, y: 2});
    //   model.sync = function(method, m, options) {
    //     options.success();
    //   };
    //   model.on('change:x', function() { assert.ok(true); });
    //   model.save({x: 3}, {wait: true});
    //   assert.equal(model.get('x'), 3);
    // });
  
    // it('save with wait validates attributes', () => {
    //   var model = new Backbone.Model();
    //   model.url = '/test';
    //   model.validate = function() { assert.ok(true); };
    //   model.save({x: 1}, {wait: true});
    // });
  
    // it('save turns on parse flag', () => {
    //   var Model = Backbone.Model.extend({
    //     sync: function(method, m, options) { assert.ok(options.parse); }
    //   });
    //   new Model().save();
    // });
  
    // it("nested `set` during `'change:attr'`", () => {
    //   assert.expect(2);
    //   var events = [];
    //   var model = new Backbone.Model();
    //   model.on('all', function(event) { events.push(event); });
    //   model.on('change', function() {
    //     model.set({z: true}, {silent: true});
    //   });
    //   model.on('change:x', function() {
    //     model.set({y: true});
    //   });
    //   model.set({x: true});
    //   assert.deepEqual(events, ['change:y', 'change:x', 'change']);
    //   events = [];
    //   model.set({z: true});
    //   assert.deepEqual(events, []);
    // });
  
    // it('nested `change` only fires once', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.on('change', function() {
    //     assert.ok(true);
    //     model.set({x: true});
    //   });
    //   model.set({x: true});
    // });
  
    // it("nested `set` during `'change'`", () => {
    //   assert.expect(6);
    //   var count = 0;
    //   var model = new Backbone.Model();
    //   model.on('change', function() {
    //     switch (count++) {
    //       case 0:
    //         assert.deepEqual(this.changedAttributes(), {x: true});
    //         assert.equal(model.previous('x'), undefined);
    //         model.set({y: true});
    //         break;
    //       case 1:
    //         assert.deepEqual(this.changedAttributes(), {x: true, y: true});
    //         assert.equal(model.previous('x'), undefined);
    //         model.set({z: true});
    //         break;
    //       case 2:
    //         assert.deepEqual(this.changedAttributes(), {x: true, y: true, z: true});
    //         assert.equal(model.previous('y'), undefined);
    //         break;
    //       default:
    //         assert.ok(false);
    //     }
    //   });
    //   model.set({x: true});
    // });
  
    // it('nested `change` with silent', () => {
    //   assert.expect(3);
    //   var count = 0;
    //   var model = new Backbone.Model();
    //   model.on('change:y', function() { assert.ok(false); });
    //   model.on('change', function() {
    //     switch (count++) {
    //       case 0:
    //         assert.deepEqual(this.changedAttributes(), {x: true});
    //         model.set({y: true}, {silent: true});
    //         model.set({z: true});
    //         break;
    //       case 1:
    //         assert.deepEqual(this.changedAttributes(), {x: true, y: true, z: true});
    //         break;
    //       case 2:
    //         assert.deepEqual(this.changedAttributes(), {z: false});
    //         break;
    //       default:
    //         assert.ok(false);
    //     }
    //   });
    //   model.set({x: true});
    //   model.set({z: false});
    // });
  
    // it('nested `change:attr` with silent', () => {
    //   assert.expect(0);
    //   var model = new Backbone.Model();
    //   model.on('change:y', function(){ assert.ok(false); });
    //   model.on('change', function() {
    //     model.set({y: true}, {silent: true});
    //     model.set({z: true});
    //   });
    //   model.set({x: true});
    // });
  
    // it('multiple nested changes with silent', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.on('change:x', function() {
    //     model.set({y: 1}, {silent: true});
    //     model.set({y: 2});
    //   });
    //   model.on('change:y', function(m, val) {
    //     assert.equal(val, 2);
    //   });
    //   model.set({x: true});
    // });
  
    // it('multiple nested changes with silent', () => {
    //   assert.expect(1);
    //   var changes = [];
    //   var model = new Backbone.Model();
    //   model.on('change:b', function(m, val) { changes.push(val); });
    //   model.on('change', function() {
    //     model.set({b: 1});
    //   });
    //   model.set({b: 0});
    //   assert.deepEqual(changes, [0, 1]);
    // });
  
    // it('basic silent change semantics', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model;
    //   model.set({x: 1});
    //   model.on('change', function(){ assert.ok(true); });
    //   model.set({x: 2}, {silent: true});
    //   model.set({x: 1});
    // });
  
    // it('nested set multiple times', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.on('change:b', function() {
    //     assert.ok(true);
    //   });
    //   model.on('change:a', function() {
    //     model.set({b: true});
    //     model.set({b: true});
    //   });
    //   model.set({a: true});
    // });
  
    // it('#1122 - clear does not alter options.', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   var options = {};
    //   model.clear(options);
    //   assert.ok(!options.unset);
    // });
  
    // it('#1122 - unset does not alter options.', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   var options = {};
    //   model.unset('x', options);
    //   assert.ok(!options.unset);
    // });
  
    // it('#1355 - `options` is passed to success callbacks', () => {
    //   assert.expect(3);
    //   var model = new Backbone.Model();
    //   var opts = {
    //     success: function( m, resp, options ) {
    //       assert.ok(options);
    //     }
    //   };
    //   model.sync = function(method, m, options) {
    //     options.success();
    //   };
    //   model.save({id: 1}, opts);
    //   model.fetch(opts);
    //   model.destroy(opts);
    // });
  
    // it("#1412 - Trigger 'sync' event.", () => {
    //   assert.expect(3);
    //   var model = new Backbone.Model({id: 1});
    //   model.sync = function(method, m, options) { options.success(); };
    //   model.on('sync', function(){ assert.ok(true); });
    //   model.fetch();
    //   model.save();
    //   model.destroy();
    // });
  
    // it('#1365 - Destroy: New models execute success callback.', () => {
    //   var done = assert.async();
    //   assert.expect(2);
    //   new Backbone.Model()
    //   .on('sync', function() { assert.ok(false); })
    //   .on('destroy', function(){ assert.ok(true); })
    //   .destroy({success: function(){
    //     assert.ok(true);
    //     done();
    //   }});
    // });
  
    // it('#1433 - Save: An invalid model cannot be persisted.', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model;
    //   model.validate = function(){ return 'invalid'; };
    //   model.sync = function(){ assert.ok(false); };
    //   assert.strictEqual(model.save(), false);
    // });
  
    // it("#1377 - Save without attrs triggers 'error'.", () => {
    //   assert.expect(1);
    //   var Model = Backbone.Model.extend({
    //     url: '/test/',
    //     sync: function(method, m, options){ options.success(); },
    //     validate: function(){ return 'invalid'; }
    //   });
    //   var model = new Model({id: 1});
    //   model.on('invalid', function(){ assert.ok(true); });
    //   model.save();
    // });
  
    // it('#1545 - `undefined` can be passed to a model constructor without coersion', () => {
    //   var Model = Backbone.Model.extend({
    //     defaults: {one: 1},
    //     initialize: function(attrs, opts) {
    //       assert.equal(attrs, undefined);
    //     }
    //   });
    //   var emptyattrs = new Model();
    //   var undefinedattrs = new Model(undefined);
    // });
  
    // it('#1478 - Model `save` does not trigger change on unchanged attributes', () => {
    //   var done = assert.async();
    //   assert.expect(0);
    //   var Model = Backbone.Model.extend({
    //     sync: function(method, m, options) {
    //       setTimeout(function(){
    //         options.success();
    //         done();
    //       }, 0);
    //     }
    //   });
    //   new Model({x: true})
    //   .on('change:x', function(){ assert.ok(false); })
    //   .save(null, {wait: true});
    // });
  
    // it('#1664 - Changing from one value, silently to another, back to original triggers a change.', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model({x: 1});
    //   model.on('change:x', function() { assert.ok(true); });
    //   model.set({x: 2}, {silent: true});
    //   model.set({x: 3}, {silent: true});
    //   model.set({x: 1});
    // });
  
    // it('#1664 - multiple silent changes nested inside a change event', () => {
    //   assert.expect(2);
    //   var changes = [];
    //   var model = new Backbone.Model();
    //   model.on('change', function() {
    //     model.set({a: 'c'}, {silent: true});
    //     model.set({b: 2}, {silent: true});
    //     model.unset('c', {silent: true});
    //   });
    //   model.on('change:a change:b change:c', function(m, val) { changes.push(val); });
    //   model.set({a: 'a', b: 1, c: 'item'});
    //   assert.deepEqual(changes, ['a', 1, 'item']);
    //   assert.deepEqual(model.attributes, {a: 'c', b: 2});
    // });
  
    // it('#1791 - `attributes` is available for `parse`', () => {
    //   var Model = Backbone.Model.extend({
    //     parse: function() { this.has('a'); } // shouldn't throw an error
    //   });
    //   var model = new Model(null, {parse: true});
    //   assert.expect(0);
    // });
  
    // it('silent changes in last `change` event back to original triggers change', () => {
    //   assert.expect(2);
    //   var changes = [];
    //   var model = new Backbone.Model();
    //   model.on('change:a change:b change:c', function(m, val) { changes.push(val); });
    //   model.on('change', function() {
    //     model.set({a: 'c'}, {silent: true});
    //   });
    //   model.set({a: 'a'});
    //   assert.deepEqual(changes, ['a']);
    //   model.set({a: 'a'});
    //   assert.deepEqual(changes, ['a', 'a']);
    // });
  
    // it('#1943 change calculations should use _.isEqual', () => {
    //   var model = new Backbone.Model({a: {key: 'value'}});
    //   model.set('a', {key: 'value'}, {silent: true});
    //   assert.equal(model.changedAttributes(), false);
    // });
  
    // it('#1964 - final `change` event is always fired, regardless of interim changes', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.on('change:property', function() {
    //     model.set('property', 'bar');
    //   });
    //   model.on('change', function() {
    //     assert.ok(true);
    //   });
    //   model.set('property', 'foo');
    // });
  
    // it('isValid', () => {
    //   var model = new Backbone.Model({valid: true});
    //   model.validate = function(attrs) {
    //     if (!attrs.valid) return 'invalid';
    //   };
    //   assert.equal(model.isValid(), true);
    //   assert.equal(model.set({valid: false}, {validate: true}), false);
    //   assert.equal(model.isValid(), true);
    //   model.set({valid: false});
    //   assert.equal(model.isValid(), false);
    //   assert.ok(!model.set('valid', false, {validate: true}));
    // });
  
    // it('mixin', () => {
    //   Backbone.Model.mixin({
    //     isEqual: function(model1, model2) {
    //       return _.isEqual(model1, model2.attributes);
    //     }
    //   });
  
    //   var model1 = new Backbone.Model({
    //     a: {b: 2}, c: 3
    //   });
    //   var model2 = new Backbone.Model({
    //     a: {b: 2}, c: 3
    //   });
    //   var model3 = new Backbone.Model({
    //     a: {b: 4}, c: 3
    //   });
  
    //   assert.equal(model1.isEqual(model2), true);
    //   assert.equal(model1.isEqual(model3), false);
    // });
  
  
    // it('toJSON receives attrs during save(..., {wait: true})', () => {
    //   assert.expect(1);
    //   var Model = Backbone.Model.extend({
    //     url: '/test',
    //     toJSON: function() {
    //       assert.strictEqual(this.attributes.x, 1);
    //       return _.clone(this.attributes);
    //     }
    //   });
    //   var model = new Model;
    //   model.save({x: 1}, {wait: true});
    // });
  
    // it('#2034 - nested set with silent only triggers one change', () => {
    //   assert.expect(1);
    //   var model = new Backbone.Model();
    //   model.on('change', function() {
    //     model.set({b: true}, {silent: true});
    //     assert.ok(true);
    //   });
    //   model.set({a: true});
    // });
  
    // it('#3778 - id will only be updated if it is set', () => {
    //   assert.expect(2);
    //   var model = new Backbone.Model({id: 1});
    //   model.id = 2;
    //   model.set({foo: 'bar'});
    //   assert.equal(model.id, 2);
    //   model.set({id: 3});
    //   assert.equal(model.id, 3);
    // });

});