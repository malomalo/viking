import 'mocha';
import * as assert from 'assert';
import Event from 'viking/eventBus';

describe('Viking.Events', () => {
    it('on and trigger', () => {
      let counter = 0;
      const obj = new Event();

      obj.addEventListener('event', () => { counter += 1; });
      obj.dispatchEvent('event');
      assert.equal(counter, 1, 'counter should be incremented.');
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      assert.equal(counter, 5, 'counter should be incremented five times.');
    });

    it('binding and triggering multiple events', () => {
      let counter = 0;
      const Rectangle = class extends Event { };
      const obj = new Rectangle();

      obj.addEventListener(['a', 'b', 'c'], () => { counter += 1; });

      obj.dispatchEvent('a');
      assert.equal(counter, 1);

      obj.dispatchEvent(['a', 'b']);
      assert.equal(counter, 3);

      obj.dispatchEvent('c');
      assert.equal(counter, 4);

      obj.removeEventListener(['a', 'c']);
      obj.dispatchEvent(['a', 'b', 'c']);
      assert.equal(counter, 5);
    });

    it('binding and triggering multiple events', () => {
      let counter = 0;
      const obj = new Event();

      const increment = () => {
        counter += 1;
      };

      obj.addEventListener({
        a: increment,
        b: increment,
        c: increment
      }, {context: obj});

      obj.dispatchEvent('a');
      assert.equal(counter, 1);

      obj.dispatchEvent(['a','b']);
      assert.equal(counter, 3);

      obj.dispatchEvent('c');
      assert.equal(counter, 4);

      obj.removeEventListener({
        a: increment,
        c: increment
      }, {context: obj});
      obj.dispatchEvent(['a', 'b', 'c']);
      assert.equal(counter, 5);
    });

    // it('binding and triggering multiple event names with event maps', () => {
    //   let counter = 0;
    //   const obj = new Event();
    //   const increment = function() { counter += 1; };

    //   obj.on({
    //     'a b c': increment
    //   });

    //   obj.trigger('a');
    //   assert.equal(counter, 1);

    //   obj.trigger('a b');
    //   assert.equal(counter, 3);

    //   obj.trigger('c');
    //   assert.equal(counter, 4);

    //   obj.off({
    //     'a c': increment
    //   });
    //   obj.trigger('a b c');
    //   assert.equal(counter, 5);
    // });

    it('binding and trigger with event maps context', () => {
      let counter = 0;
      const context = {};
      const obj = new Event();

      obj.addEventListener({
        a: function() {
          counter += 1;
          assert.strictEqual(this, context, 'defaults `context` to `callback` param');
        }
      }, {context: context}).dispatchEvent('a');

      assert.equal(counter, 1);
    });

    it('bindTo and unbindFrom', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, '*', () => {
        counter += 1;
        assert.ok(true);
      });
      b.dispatchEvent('anything');
      a.addEventListenerFor(b, '*', () => {
        counter += 1;
        assert.ok(false);
      });
      a.removeEventListenerFor();
      b.dispatchEvent('anything');
      assert.equal(counter, 1);
    });

    it('bindTo and unbindFrom with event maps1', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();
      const cb = () => { counter += 1; };

      a.addEventListenerFor(b, {event: cb}); // 1
      b.dispatchEvent('event'); // => 1
      assert.equal(counter, 1);
      a.addEventListenerFor(b, {event2: cb}); // 2
      b.addEventListener('event2', cb); // 3
      a.removeEventListenerFor(b, {event2: cb}); // 2
      b.dispatchEvent(['event', 'event2']); // => 3
      assert.equal(counter, 3);
      a.removeEventListenerFor(); // => 1
      b.dispatchEvent(['event', 'event2']); // => 4

      assert.equal(counter, 4);
    });

    it('unbindFrom with omitted args', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();
      const cb = () => { counter += 1; };

      a.addEventListenerFor(b, 'event', cb);
      b.addEventListener('event', cb);
      a.addEventListenerFor(b, 'event2', cb);
      a.removeEventListenerFor(null, {event: cb});
      b.dispatchEvent(['event', 'event2']);
      b.removeEventListener();
      a.addEventListenerFor(b, ['event', 'event2'], cb);
      a.removeEventListenerFor(null, 'event');
      a.removeEventListenerFor();
      b.dispatchEvent(['event', 'event2']);

      assert.equal(counter, 2);
    });

    it('bindToOnce', () => {
      // Same as the previous test, but we use once rather than having to explicitly unbind
      let counterA = 0;
      let counterB = 0;

      const obj = new Event();
      const incrA = () => { counterA += 1; obj.dispatchEvent('event'); };
      const incrB = () => { counterB += 1; };

      obj.addEventListenerFor(obj, 'event', incrA, {once: true});
      obj.addEventListenerFor(obj, 'event', incrB, {once: true});
      obj.dispatchEvent('event');
      assert.equal(counterA, 1, 'counterA should have only been incremented once.');
      assert.equal(counterB, 1, 'counterB should have only been incremented once.');
    });

    it('bindToOnce and unbindFrom', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, '*', function() { counter += 1; }, {once: true});
      b.dispatchEvent('anything');
      b.dispatchEvent('anything');
      a.addEventListenerFor(b, '*', function() { assert.ok(false); }, {once: true});
      a.removeEventListenerFor();
      b.dispatchEvent('anything');
      assert.equal(counter, 1);
    });

    it('bindTo, bindToOnce and unbindFrom', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, '*', function() { counter += 1; }, {once: true});
      b.dispatchEvent('anything');
      b.dispatchEvent('anything');
      a.addEventListenerFor(b, 'all', function() { assert.ok(false); });
      a.removeEventListenerFor();
      b.dispatchEvent('anything');

      assert.equal(counter, 1);
    });

    it('bindTo and unbindFrom with event maps2', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, {change: function(){ counter += 1; }});
      b.dispatchEvent('change');
      a.addEventListenerFor(b, {change: function(){ assert.ok(false); }});
      a.removeEventListenerFor();
      b.dispatchEvent('change');

      assert.equal(counter, 1);
    });

    it('bindTo yourself', () => {
      let counter = 0;
      const a = new Event();

      a.addEventListenerFor(a, 'foo', function(){ counter += 1; });
      a.dispatchEvent('foo');

      assert.equal(counter, 1);
    });

    it('bindTo yourself cleans yourself up with unbindFrom', () => {
      let counter = 0;
      const a = new Event();

      a.addEventListenerFor(a, 'foo', function(){ counter += 1; });
      a.dispatchEvent('foo');
      a.removeEventListenerFor();
      a.dispatchEvent('foo');
    });

    it('unbindFrom cleans up references', () => {
      const a = new Event();
      const b = new Event();
      const fn = function() {};

      b.addEventListener('event', fn);
      a.addEventListenerFor(b, 'event', fn).removeEventListenerFor();
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._listeners), 0);
      a.addEventListenerFor(b, 'event', fn).removeEventListenerFor(b);
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._listeners), 0);
      a.addEventListenerFor(b, 'event', fn).removeEventListenerFor(b, 'event');
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._listeners), 0);
      a.addEventListenerFor(b, 'event', fn).removeEventListenerFor(b, 'event', fn);
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._listeners), 0);
    });

    it('unbindFrom cleans up references from bindToOnce', () => {
      const a = new Event();
      const b = new Event();
      const fn = () => {};

      b.addEventListener('event', fn);
      a.addEventListenerFor(b, 'event', fn, {once: true}).removeEventListenerFor();
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._events), 0);
      a.addEventListenerFor(b, 'event', fn, {once: true}).removeEventListenerFor(b);
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._events), 0);
      a.addEventListenerFor(b, 'event', fn, {once: true}).removeEventListenerFor(b, 'event');
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._events), 0);
      a.addEventListenerFor(b, 'event', fn, {once: true}).removeEventListenerFor(b, 'event', fn);
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(b.eventListeners.event.length, 1);
      // assert.equal(_.size(b._events), 0);
    });

    it('bindTo and off cleaning up references', () => {
      const a = new Event();
      const b = new Event();
      const fn = () => {};

      a.addEventListenerFor(b, 'event', fn);
      b.removeEventListener();
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(Object.keys(b.eventListeners).length, 0);
      a.addEventListenerFor(b, 'event', fn);
      b.removeEventListener('event');
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(Object.keys(b.eventListeners).length, 0);
      a.addEventListenerFor(b, 'event', fn);
      b.removeEventListener(null, fn);
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(Object.keys(b.eventListeners).length, 0);
      a.addEventListenerFor(b, 'event', fn);
      b.removeEventListener(null, null, {context: a});
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(Object.keys(b.eventListeners).length, 0);
    });

    it('bindTo and unbindFrom cleaning up references', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();
      const fn = () => {};

      a.addEventListenerFor(b, '*', function(){ counter += 1; });
      b.dispatchEvent('anything');
      a.addEventListenerFor(b, 'other', function(){ assert.ok(false); });
      a.removeEventListenerFor(b, 'other');
      a.removeEventListenerFor(b, '*');
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(counter, 1);
    });

    it('bindToOnce without context cleans up references after the event has fired', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, '*', function(){ counter += 1; }, {once: true});
      b.dispatchEvent('anything');
      assert.equal(Object.keys(a.bindedObjects).length, 0);
      assert.equal(counter, 1);
    });

    it('bindToOnce with event maps cleans up references', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, {
        one: function() { counter += 1; },
        two: function() { assert.ok(false); }
      }, {once: true});
      b.dispatchEvent('one');
      assert.equal(Object.keys(a.bindedObjects).length, 1);
      assert.equal(counter, 1);
    });

    it('bindToOnce with event maps binds the correct `this`', () => {
      let counter = 0;
      const a = new Event();
      const b = new Event();

      a.addEventListenerFor(b, {
        one: function() { assert.ok(this === a); counter += 1; },
        two: function() { assert.ok(false); }
      }, {once: true});
      b.dispatchEvent('one');
      assert.equal(counter, 1);
    });

    it('trigger all for each event', () => {
      let counter = 0;
      const obj = new Event();

      let a, b;
      obj.addEventListener('*', function(event) {
        counter++;
        if (event === 'a') a = true;
        if (event === 'b') b = true;
      }).dispatchEvent(['a', 'b']);
      assert.ok(a);
      assert.ok(b);
      assert.equal(counter, 2);
    });

    it('on, then unbind all functions', () => {
      let counter = 0;
      const obj = new Event();
      const callback = function() { counter += 1; };

      obj.addEventListener('event', callback);
      obj.dispatchEvent('event');
      obj.removeEventListener('event');
      obj.dispatchEvent('event');
      assert.equal(counter, 1, 'counter should have only been incremented once.');
    });

    it('bind two callbacks, unbind only one', () => {
      let counterA = 0;
      let counterB = 0;

      const Rectangle = class extends Event { };
      const obj = new Rectangle();
      const callback = function() { counterA += 1; };
      obj.addEventListener('event', callback);
      obj.addEventListener('event', function() { counterB += 1; });
      obj.dispatchEvent('event');
      obj.removeEventListener('event', callback);
      obj.dispatchEvent('event');
      assert.equal(counterA, 1, 'counterA should have only been incremented once.');
      assert.equal(counterB, 2, 'counterB should have been incremented twice.');
    });

    it('unbind a callback in the midst of it firing', () => {
      let counter = 0;
      const obj = new Event();
      const callback = function() {
        counter += 1;
        obj.removeEventListener('event', callback);
      };
      obj.addEventListener('event', callback);
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      assert.equal(counter, 1, 'the callback should have been unbound.');
    });

    it('two binds that unbind themeselves', () => {
      let counterA = 0;
      let counterB = 0;

      const obj = new Event();
      const incrA = function(){ counterA += 1; obj.removeEventListener('event', incrA); };
      const incrB = function(){ counterB += 1; obj.removeEventListener('event', incrB); };
      obj.addEventListener('event', incrA);
      obj.addEventListener('event', incrB);
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      assert.equal(counterA, 1, 'counterA should have only been incremented once.');
      assert.equal(counterB, 1, 'counterB should have only been incremented once.');
    });

    it('bind a callback with a default context when none supplied', () => {
      let counter = 0;

      const Rectangle = class extends Event {
        assertTrue() {
          counter++;
          assert.equal(this, obj, '`this` was bound to the callback');
        }
      };
      const obj = new Rectangle();

      obj.addEventListener('event', obj.assertTrue);
      obj.dispatchEvent('event');
      assert.equal(counter, 1);
    });

    it('bind a callback with a supplied context', () => {
      let counter = 0;

      const TestClass = class extends Event {
        assertTrue() {
          counter++;
          assert.ok(true, '`this` was bound to the callback');
        }
      };

      const Rectangle = class extends Event { };
      const obj = new Rectangle();
      obj.addEventListener('event', function() { this.assertTrue(); }, {context: new TestClass()});
      obj.dispatchEvent('event');
      assert.equal(counter, 1);
    });

    it('nested trigger with unbind', () => {
      let counter = 0;

      const obj = new Event();
      const incr1 = function(){ counter += 1; obj.removeEventListener('event', incr1); obj.dispatchEvent('event'); };
      const incr2 = function(){ counter += 1; };
      obj.addEventListener('event', incr1);
      obj.addEventListener('event', incr2);
      obj.dispatchEvent('event');
      assert.equal(counter, 3, 'counter should have been incremented three times');
    });

    it('callback list is not altered during trigger', () => {
      let counter = 0;

      const Rectangle = class extends Event { };
      const obj = new Rectangle();
      const incr = function(){ counter++; };
      const incrOn = function(){ obj.addEventListener('event *', incr); };
      const incrOff = function(){ obj.removeEventListener('event *', incr); };

      obj.addEventListener(['event', '*'], incrOn).dispatchEvent('event');
      assert.equal(counter, 0, 'on does not alter callback list');

      obj.removeEventListener().addEventListener('event', incrOff).addEventListener(['event', '*'], incr).dispatchEvent('event');
      assert.equal(counter, 2, 'off does not alter callback list');
    });

    it("#1282 - 'all' callback list is retrieved after each event.", () => {
      let counter = 0;
      const obj = new Event();
      const incr = function(){ counter++; };
      obj.addEventListener('x', function() {
        obj.addEventListener('y', incr).addEventListener('*', incr);
      })
      .dispatchEvent(['x', 'y']);
      assert.strictEqual(counter, 2);
    });

    // it('if callback is truthy but not a function, `on` should throw an error just like jQuery', () => {
    //   assert.expect(1);
    //   var view = _.extend({}, Backbone.Events).addEventListener('test', 'noop');
    //   assert.raises(function() {
    //     view.dispatchEvent('test');
    //   });
    // });

    it('remove all events for a specific context', () => {
      let counter = 0;
      const obj = new Event();
      obj.addEventListener(['x', 'y', '*'], function() { counter++; });
      obj.addEventListener(['x', 'y', '*'], function() { assert.ok(false); }, { context: obj });
      obj.removeEventListener(null, null, { context: obj });
      obj.dispatchEvent(['x', 'y']);
      assert.equal(counter, 4);
    });

    it('remove all events for a specific callback', () => {
      let counter = 0;
      const obj = new Event();
      const success = function() { counter++; };
      const fail = function() { assert.ok(false); };
      obj.addEventListener(['x', 'y', '*'], success);
      obj.addEventListener(['x', 'y', '*'], fail);
      obj.removeEventListener(null, fail);
      obj.dispatchEvent(['x', 'y']);
      assert.equal(counter, 4);
    });

    it('#1310 - off does not skip consecutive events', () => {
      var obj = new Event();
      obj.addEventListener('event', function() { assert.ok(false); }, {context: obj});
      obj.addEventListener('event', function() { assert.ok(false); }, {context: obj});
      obj.removeEventListener(null, null, {context: obj});
      obj.dispatchEvent('event');
    });

    it('once', () => {
      // Same as the previous test, but we use once rather than having to explicitly unbind
      let counterA = 0;
      let counterB = 0;
      const obj = new Event();
      const incrA = function(){ counterA += 1; obj.dispatchEvent('event'); };
      const incrB = function(){ counterB += 1; };

      obj.addEventListener('event', incrA, {once: true});
      obj.addEventListener('event', incrB, {once: true});
      obj.dispatchEvent('event');
      assert.equal(counterA, 1, 'counterA should have only been incremented once.');
      assert.equal(counterB, 1, 'counterB should have only been incremented once.');
    });

    it('once variant one', () => {
      let counter = 0;
      const f = function(){ counter++; };

      const a = new Event();
      const b = new Event();

      a.addEventListener('event', f, {once: true});
      b.addEventListener('event', f);

      a.dispatchEvent('event');

      b.dispatchEvent('event');
      b.dispatchEvent('event');

      assert.equal(counter, 3);
    });

    it('once variant two', () => {
      let counter = 0;
      const f = function(){ counter++; };
      const obj = new Event();

      obj
        .addEventListener('event', f, {once: true})
        .addEventListener('event', f)
        .dispatchEvent('event')
        .dispatchEvent('event');

      assert.equal(counter, 3);
    });

    it('once with off', () => {
      let counter = 0;
      const f = function(){ counter++; };
      const obj = new Event();

      obj.addEventListener('event', f, {once: true});
      obj.removeEventListener('event', f);
      obj.dispatchEvent('event');

      assert.equal(counter, 0);
    });

    it('once with event maps', () => {
      let counter = 0;
      const obj = new Event();
      const increment = function() {
        counter += 1;
      };

      obj.addEventListener({
        a: increment,
        b: increment,
        c: increment
      }, {context: obj, once: true});

      obj.dispatchEvent('a');
      assert.equal(counter, 1);

      obj.dispatchEvent(['a', 'b']);
      assert.equal(counter, 2);

      obj.dispatchEvent('c');
      assert.equal(counter, 3);

      obj.dispatchEvent(['a', 'b', 'c']);
      assert.equal(counter, 3);
    });

    it('bind a callback with a supplied context using once with object notation', () => {
      let counter = 0;
      const obj = new Event();
      const context = {};

      obj.addEventListener({
        a: function() {
          counter++;
          assert.strictEqual(this, context, 'defaults `context` to `callback` param');
        }
      }, {context: context, once: true}).dispatchEvent('a');

      assert.equal(counter, 1);
    });

    it('once with off only by context', () => {
      const obj = new Event();
      obj.addEventListener('event', function(){ assert.ok(false); }, {context: context});
      obj.removeEventListener(null, null, {context: context});
      obj.dispatchEvent('event');
    });

// it('Backbone object inherits Events', () => {
//   assert.ok(Backbone.bind === Backbone.Events.bind);
// });

    // it('once with asynchronous events', () => {
    //   var done = assert.async();
    //   assert.expect(1);
    //   var func = _.debounce(function() { assert.ok(true); done(); }, 50);
    //   var obj = _.extend({}, Backbone.Events).bindce('async', func);

    //   obj.dispatchEvent('async');
    //   obj.dispatchEvent('async');
    // });

    it('once with multiple events.', () => {
      let counter = 0;
      var obj = new Event();
      obj.addEventListener(['x', 'y'], function() { counter++; }, {once: true});
      obj.dispatchEvent(['x', 'y']);
      assert.equal(counter, 2);
    });

    it('Off during iteration with once.', () => {
      let counter = 0;
      const obj = new Event();
      const f = function(){ this.removeEventListener('event', f); };
      obj.addEventListener('event', f);
      obj.addEventListener('event', function(){}, {once: true});
      obj.addEventListener('event', function(){ counter++; });

      obj.dispatchEvent('event');
      obj.dispatchEvent('event');
      assert.equal(counter, 2);
    });

    it('`once` on `all` should work as expected', () => {
      let counter = 0;
      const obj = new Event();

      obj.addEventListener('*', function() {
        counter++;
        obj.dispatchEvent('*');
      }, {once: true});
      obj.dispatchEvent('*');
      assert.equal(counter, 1);
    });

    it('event functions are chainable', () => {
      const obj = new Event();
      const obj2 = new Event();
      const fn = function() {};

      assert.equal(obj, obj.dispatchEvent('noeventssetyet'));
      assert.equal(obj, obj.removeEventListener('noeventssetyet'));
      assert.equal(obj, obj.removeEventListenerFor('noeventssetyet'));
      assert.equal(obj, obj.addEventListener('a', fn));
      assert.equal(obj, obj.addEventListener('c', fn, {once: true}));
      assert.equal(obj, obj.dispatchEvent('a'));
      assert.equal(obj, obj.addEventListenerFor(obj2, 'a', fn));
      assert.equal(obj, obj.addEventListenerFor(obj2, 'b', fn, {once: true}));
      assert.equal(obj, obj.removeEventListener(['a', 'c']));
      assert.equal(obj, obj.removeEventListenerFor(obj2, 'a'));
      assert.equal(obj, obj.removeEventListenerFor());
    });

    it('#3448 - bindToOnce with space-separated events', () => {
      let count = 1;
      const one = new Event();
      const two = new Event();

      one.addEventListenerFor(two, ['x', 'y'], function(n) { assert.ok(n === count++); }, {once: true});
      two.dispatchEvent('x', 1);
      two.dispatchEvent('x', 1);
      two.dispatchEvent('y', 2);
      two.dispatchEvent('y', 2);
    });

    it('#3611 - bindTo is compatible with non-Backbone event libraries', () => {
      let counter = 0;
      const obj = new Event();
      const other = {
        events: {},
        addEventListener: function(name, callback) {
          this.events[name] = callback;
        },
        trigger: function(name) {
          this.events[name]();
        }
      };

      obj.addEventListenerFor(other, 'test', function() { counter++; });
      other.trigger('test');
      assert.equal(counter, 1);
    });

    it('#3611 - unbindFrom is compatible with non-Backbone event libraries', () => {
      let counter = 0;
      const obj = new Event();
      const other = {
        events: {},
        addEventListener: function(name, callback) {
          this.events[name] = callback;
        },
        removeEventListener: function() {
          this.events = {};
        },
        trigger: function(name) {
          var fn = this.events[name];
          if (fn) fn();
        }
      };

      obj.addEventListenerFor(other, 'test', function() { assert.ok(false); });
      obj.removeEventListenerFor(other);
      other.trigger('test');
      assert.equal(Object.keys(obj.bindedObjects).length, 0);
    });

});