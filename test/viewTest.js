import 'mocha';
import * as assert from 'assert';
import View from 'viking/view';

describe('Viking.View', () => {

    // beforeEach(function(done) {
    //     $('#qunit-fixture').append(
    //       '<div id="testElement"><h1>Test</h1></div>'
    //     );

    //     // view = new Backbone.View({
    //     //   id: 'test-view',
    //     //   className: 'test-view',
    //     //   other: 'non-special-option'
    //     // });
    // });

    // afterEach(function(done) {
    //     $('#testElement').remove();
    //     $('#test-view').remove();
    // });

    it('constructor', () => {
        const view = new View({
            id: 'test-id',
            className: 'test-class'
        });

        assert.equal(view.el.id, 'test-id');
        assert.equal(view.el.className, 'test-class');
    });

    it('$', () => {
      const myView = new View();
      myView.el.innerHTML = '<p><a><b>test</b></a></p>';
      const result = myView.$('a b');

      assert.strictEqual(result[0].innerHTML, 'test');
    });

    // it('$el', () => {
    // assert.expect(3);
    // var myView = new Backbone.View;
    // myView.setElement('<p><a><b>test</b></a></p>');
    // assert.strictEqual(myView.el.nodeType, 1);

    // assert.ok(myView.$el instanceof Backbone.$);
    // assert.strictEqual(myView.$el[0], myView.el);
    // });

    it('initialize', () => {
        class MyView extends View {
            initialize() {
                this.one = 1;
            }
        }

        assert.equal((new MyView()).one, 1);
    });

//     it('preinitialize', () => {
//       assert.expect(1);
//       var View = Backbone.View.extend({
//         preinitialize: function() {
//           this.one = 1;
//         }
//       });

//       assert.strictEqual(new View().one, 1);
//     });

//     it('preinitialize occurs before the view is set up', () => {
//       assert.expect(2);
//       var View = Backbone.View.extend({
//         preinitialize: function() {
//           assert.equal(this.el, undefined);
//         }
//       });
//       var _view = new View({});
//       assert.notEqual(_view.el, undefined);
//     });

    it('render', () => {
      const myView = new View();
      assert.equal(myView.render(), myView, '#render returns the view instance');
    });

    it('delegateEvents', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter1 = 0;
        let counter2 = 0;

        class MyView extends View {
            increment() {
                counter1++;
            }
        }
        const myView = new MyView({el: '#testElement'});
        myView.el.addEventListener('click', function() { counter2++; });

        const events = {'click h1': 'increment'};

        myView.delegateEvents(events);
        myView.$('h1')[0].click();
        assert.equal(counter1, 1);
        assert.equal(counter2, 1);

        myView.$('h1')[0].click();
        assert.equal(counter1, 2);
        assert.equal(counter2, 2);

        myView.delegateEvents(events);
        myView.$('h1')[0].click();
        assert.equal(counter1, 3);
        assert.equal(counter2, 3);
    });

    it('delegate', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter = 0;
        const myView = new View({el: '#testElement'});

        myView.delegate('click', 'h1', function() {
            counter++;
        });
        myView.delegate('click', function() {
            counter++;
        });
        myView.$('h1')[0].click();

        assert.equal(counter, 2);
        // assert.equal(myView.delegate(), myView, '#delegate returns the view instance');
    });

    it('delegateEvents allows functions for callbacks', () => {
        class MyView extends View {
            counter = 0;
        }
        let myView = new MyView();

        let events = {
            click: function() { this.counter++; }
        };

        myView.delegateEvents(events);
        myView.el.click();
        assert.equal(myView.counter, 1);

        myView.el.click();
        assert.equal(myView.counter, 2);

        myView.delegateEvents(events);
        myView.el.click();
        assert.equal(myView.counter, 3);
    });

    it('delegateEvents ignore undefined methods', () => {
      let myView = new View();
      myView.delegateEvents({click: 'undefinedMethod'});
      myView.el.click();
    });

    it('undelegateEvents', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter1 = 0;
        let counter2 = 0;

        class MyView extends View {
            increment() { counter1++; }
        }
        const myView = new MyView({el: '#testElement'});
        myView.el.addEventListener('click', function() { counter2++; });

        const events = {'click h1': 'increment'};
        myView.delegateEvents(events);
        myView.$('h1')[0].click();
        assert.equal(counter1, 1);
        assert.equal(counter2, 1);

        myView.undelegateEvents();
        myView.$('h1')[0].click();
        assert.equal(counter1, 1);
        assert.equal(counter2, 2);

        myView.delegateEvents(events);
        myView.$('h1')[0].click();
        assert.equal(counter1, 2);
        assert.equal(counter2, 3);

        assert.equal(myView.undelegateEvents(), myView, '#undelegateEvents returns the view instance');
    });

    it('undelegate', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        const myView = new View({el: '#testElement'});
        myView.delegate('click', function() { assert.ok(false); });
        myView.delegate('click', 'h1', function() { assert.ok(false); });

        myView.undelegate('click');

        myView.$('h1')[0].click();
        myView.el.click();

        assert.equal(myView.undelegate(), myView, '#undelegate returns the view instance');
    });

    it('undelegate with passed handler', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter = 0;
        let myView = new View({el: '#testElement'});
        let listener = function() { assert.ok(false); };

        myView.delegate('click', listener);
        myView.delegate('click', function() { counter++; });
        myView.undelegate('click', listener);
        myView.el.click();
        assert.equal(counter, 1);
    });

    it('undelegate with selector', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter = 0;
        let myView = new View({el: '#testElement'});

        myView.delegate('click', function() { counter++; });
        myView.delegate('click', 'h1', function() { assert.ok(false); });
        myView.undelegate('click', 'h1');
        myView.$('h1')[0].click();
        myView.el.click();
        assert.equal(counter, 2);
    });

    it('undelegate with handler and selector', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter = 0;
        let myView = new View({el: '#testElement'});

        myView.delegate('click', function() { counter++; });
        let handler = function() { assert.ok(false); };
        myView.delegate('click', 'h1', handler);
        myView.undelegate('click', 'h1', handler);
        myView.$('h1')[0].click();
        myView.el.click();
        assert.equal(counter, 2);
    });

    it('tagName can be provided as a string', () => {
        class MyView extends View {
            static tagName = 'span';
        }

        assert.equal(new MyView().el.tagName, 'SPAN');
    });

    it('tagName can be provided as a function', () => {
        class MyView extends View {
            static tagName = () => { return 'p'; };
        }

        assert.ok(new MyView().el.tagName, 'P');
    });

    it('_ensureElement with DOM node el', () => {
        class MyView extends View {
            el = document.body
        }

        assert.equal(new MyView().el, document.body);
    });

    it('_ensureElement with string el', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';

        class View1 extends View {
            static el = 'body';
        }
        assert.strictEqual(new View1().el, document.body);

        class View2 extends View {
            static el = '#testElement > h1';
        }
        assert.strictEqual(new View2().el, document.querySelectorAll('#testElement > h1')[0]);

        // class View3 extends View {
        //     static el = '#nonexistent';
        // }
        // assert.ok(!new View3().el);
    });

    it('with className and id functions', () => {
        class MyView extends View {
            static className = function () {
                return 'className';
            };
            static id = function () {
                return 'id';
            };
        }

        assert.strictEqual(new MyView().el.className, 'className');
        assert.strictEqual(new MyView().el.id, 'id');
    });

    it('with attributes', () => {
        class MyView extends View {
            static attributes = {
                'id': 'id',
                'class': 'class'
            };
        }

        assert.strictEqual(new MyView().el.className, 'class');
        assert.strictEqual(new MyView().el.id, 'id');
    });

    it('with attributes as a function', () => {
        class MyView extends View {
            static attributes = function() {
                return {'class': 'dynamic'};
            };
        }

        assert.strictEqual(new MyView().el.className, 'dynamic');
    });

    it('should default to className/id properties', () => {
        class MyView extends View {
            static className = 'backboneClass';
            static id = 'backboneId';
            static attributes = {
                'class': 'attributeClass',
                'id': 'attributeId'
            };
        }

        var myView = new MyView;
        assert.strictEqual(myView.el.className, 'backboneClass');
        assert.strictEqual(myView.el.id, 'backboneId');
    });

    it('multiple views per element', () => {
        let count = 0;
        let el = document.createElement('p');

        class MyView extends View {
            static el = el;
            static events = {
                click: () => { count++; }
            };
        }

        let view1 = new MyView();
        el.click();
        assert.equal(1, count);

        let view2 = new MyView();
        el.click();
        assert.equal(3, count);

        view1.delegateEvents();
        el.click();
        assert.equal(5, count);
    });

    it('custom events', () => {
        let counter = 0;
        class MyView extends View {
            static el = document.body;
            static events = {
                fake$event: function() { counter++; }
            };
        }

        let myView = new MyView();
        document.body.dispatchEvent(new Event('fake$event'));
        document.body.dispatchEvent(new Event('fake$event'));
        assert.equal(counter, 2);

        myView.undelegate();
        document.body.dispatchEvent(new Event('fake$event'));
        assert.equal(counter, 2);
    });

    it('#986 - Undelegate before changing element.', () => {
        document.body.innerHTML = '<button></button><button></button>';
        let counter = 0;

        let button1 = document.body.children[0];
        let button2 = document.body.children[1];

        class MyView extends View {
            static events = {
                click: function(e) {
                    counter++;
                    assert.ok(myView.el === e.target);
                }
            };
        }

        let myView = new MyView({el: button1});
        myView.setElement(button2);

        button1.click();
        button2.click();

        assert.equal(counter, 1);
    });

    it('#1172 - Clone attributes object', () => {
        class MyView extends View {
            static attributes = {foo: 'bar'};
        }

        let view1 = new MyView({id: 'foo'});
        assert.strictEqual(view1.el.id, 'foo');

        let view2 = new MyView();
        assert.ok(!view2.el.id);
    });

    // it('views stopListening', () => {
    //     class MyView extends View {
    //         initialize() {
    //             this.addEventListenerFor(this.model, 'all x', function() { assert.ok(false); });
    //             this.addEventListenerFor(this.collection, 'all x', function() { assert.ok(false); });
    //         }
    //     }

    //     let myView = new MyView({
    //         model: new Backbone.Model,
    //         collection: new Backbone.Collection
    //     });

    //     myView.stopListening();
    //     myView.model.trigger('x');
    //     myView.collection.trigger('x');
    // });

    it('Provide function for el.', () => {
        class MyView extends View {
            static el = function() {
                return document.createElement('a');
            };
        }

        var myView = new MyView();
        assert.equal(myView.el.tagName, 'A');
    });

    it('events passed in options', () => {
        document.body.innerHTML = '<div id="testElement"><h1>Test</h1></div>';
        let counter = 0;

        class MyViewClass extends View {
            static el = '#testElement';

            increment() { counter++; }
        }

        const myView = new MyViewClass({
            events: { 'click h1': 'increment' }
        });

        myView.$('h1')[0].click();
        myView.$('h1')[0].click();

        assert.equal(counter, 2);
    });

    it('remove', () => {
        const myView = new View();
        document.body.appendChild(myView.el);

        myView.delegate('click', function() { assert.ok(false); });
        myView.addEventListenerFor(myView, ['*', 'x'], function(eventName) {
          if (eventName !== 'removed' && eventName !== 'onremove') {
            assert.ok(false);
          }
        });

        assert.equal(myView.remove(), myView, '#remove returns the view instance');
        myView.el.click();
        myView.dispatchEvent('x');

        // In IE8 and below, parentNode still exists but is not document.body.
        assert.notEqual(myView.el.parentNode, document.body);
    });

    it('setElement', () => {
        let counter = 0;
        class MyViewClass extends View {
            events = {
                click: function() { assert.ok(false); }
            };
        }

        const myView = new MyViewClass();

        myView.events = {
            click: function() { counter++; }
        };

        const oldEl = myView.el;
        myView.setElement(document.createElement('div'));

        oldEl.click();
        myView.el.click();

        assert.notEqual(oldEl, myView.el);
        assert.equal(counter, 1);
    });

    it('inherits events', () => {
        class MyView extends View {
            static events = {
                click: 'click'
            };
        }
        class MySubView extends MyView {
            static events = {
                hover: 'hover'
            };
        }

        assert.deepEqual(MySubView.getEvents(), {
            click: 'click',
            hover: 'hover'
        });
    });

    it('overrides inherited events', () => {
        class MyView extends View {
            static events = {
                click: 'click',
                hover: 'hover'
            };
        }

        class SubView extends MyView {
            static events = {
                hover: 'newHover'
            };
        }

        assert.deepEqual(SubView.getEvents(), {
            click: 'click',
            hover: 'newHover'
        });
    });

    // it('renderTemplate with template set on view', () => {
    //     class MyView extends View {
    //         static template = 'a/template/path';
    //     }

    //     assert.equal(
    //         (new MyView()).renderTemplate(),
    //         '<h1>Some Title</h1>'
    //     );
    // });

    // it('renderTemplate without template set on view', () => {
    //     class MyView extends View { }

    //     assert.throws(
    //         () => { (new MyView()).renderTemplate(); },
    //         Error,
    //         'Template does not exist: '
    //     );
    // });

    it("#remove() triggers a 'remove' event on the view", () => {
        let counter = 0;
        const view = new View();

        view.addEventListener('removed', () => {
            counter += 1;
        });

        view.remove();
        view.removeEventListener('removed');

        assert.equal(counter, 1);
    });

    // test('#bindEl() with a model', async () => {
    //     const model = new Viking.Model();
    //     const view = new Viking.View({ model });

    //     await new Promise((resolve) => {
    //         view.$ = (selector) => {
    //             assert.equal(selector, '.name');
    //             return {
    //                 html: (html) => {
    //                     assert.equal(html, 'Dr. DJ');
    //                     resolve();
    //                 }
    //             };
    //         };

    //         view.bindEl('name', '.name');
    //         model.set('name', 'Dr. DJ');
    //     });
    // });

    // test('#bindEl() with a model with custom render', async () => {
    //     const model = new Viking.Model();
    //     const view = new Viking.View({ model });

    //     await new Promise((resolve) => {
    //         view.$ = (selector) => {
    //             assert.equal(selector, '.name');
    //             return {
    //                 html: (html) => {
    //                     assert.equal(html, 'Name: Dr. DJ');
    //                     resolve();
    //                 }
    //             };
    //         };

    //         view.bindEl('name', '.name', (model) => 'Name: ' + model.get('name'));
    //         model.set('name', 'Dr. DJ');
    //     });
    // });

    describe("subView", () => {
        
        it("Initalization setups a new array for subView", () => {
            var view = new View();
            var view2 = new View();

            assert.deepEqual(view.subViews, []);
            assert.notStrictEqual(view.subViews, view2.subViews);
        });

        it("#subView", () => {
            var view = new View();
            var mysubview = view.subView(View);
        
            assert.ok(view.subViews.includes(mysubview));
            assert.ok(mysubview instanceof View);
        });
    
        it("#subView passes options to subView", () => {
            let args;
            
            class SubView extends View {
                constructor(...options) {
                    super();
                    args = options;
                }
            }
            
            let view = new View();
            let subview = view.subView(SubView, {'my': 'options'});
            
            assert.deepEqual(args, [{'my': 'options'}]);
        });

        it("#removeSubView", () => {
            let view = new View();
            let subview = view.subView(View);
            let counter = 0;
            
            // subview.remove = () => { counter += 1; }
            view.removeEventListenerFor = (obj) => {
                counter += 1;
                assert.strictEqual(obj, subview);
            }
            
            view.removeSubView(subview);
            // assert.equal(counter, 2);
            assert.ok(!view.subViews.includes(subview));
        });

        it("#remove", () => {
            let view = new View();
            let subview = view.subView(View);
            let counter = 0;

            // Assert SubView.remove is called
            subview.remove = () => { counter += 1; }
            view.remove();
            assert.equal(counter, 1);
        });

        it("subview#remove() removes itself from the parent subViews", () => {
            let view = new View();
            let subview = view.subView(View);

            subview.remove();
            assert.deepEqual([], view.subViews);
        });

    });
    
    describe("assignableProperties", () => {
        it("assigns", () => {
            class Test extends View {
                static assignableProperties = [
                    'lorem'
                ]
            }
            
            const view = new Test({lorem: 99})
            assert.equal(view.lorem, 99)
        })
        
        it("keeps extended assignables", () => {
            class Test extends View {
                static assignableProperties = [
                    'lorem'
                ]
            }
            
            class Test2 extends Test {
                static assignableProperties = [
                    'ipsum'
                ]
            }

            const view = new Test2({lorem: 99, ipsum: 88})
            assert.equal(view.lorem, 99)
            assert.equal(view.ipsum, 88)
        })
    })
});
