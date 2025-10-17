import assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';

describe('Viking.Record::Associations', () => {
    describe('HasMany events', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasMany(Parent)];
        }
        
        describe('beforeLoad event on association', () => {
            it('on association.load()', function (done) {
                let model = new Model({id: 24});
                let counter = 1;
                
                model.association('parents').addEventListener('beforeLoad', records => {
                    assert.equal(counter, 1);
                    counter += 1;
                    assert.deepEqual(records, []);
                });

                // Load twive to ensure if fires once since already loaded
                model.parents.load().then(() => {
                    assert.equal(counter, 2);
                }).then(done, done);
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            })
            
            it('not on association.load() if already loaded', function (done) {
                let model = new Model({id: 24});
                let counter = 1;
                
                model.association('parents').addEventListener('beforeLoad', records => {
                    assert.equal(counter, 1);
                    counter += 1;
                    assert.deepEqual(records, []);
                });

                // Load twive to ensure if fires once since already loaded
                model.parents.load().then(() => model.parents.load()).then(() => {
                    assert.equal(counter, 2);
                }).then(done, done);
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            })
        })
        
        describe('afterLoad event on association', () => {
            it('on association.load()', function (done) {
                let model = new Model({id: 24});
                
                model.association('parents').addEventListener('afterLoad', records => {
                    assert.equal(records[0].readAttribute('id'), 2)
                    done()
                })
                model.parents.load();
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            })
            
            it("not on association.load() if already loaded", function (done) {
                let model = new Model({id: 24});
                let counter = 0
                
                model.association('parents').addEventListener('afterLoad', records => {
                    counter += 1
                });
                
                model.association('parents').load().then(() => {
                    model.association('parents').load().then(r => {
                        assert.equal(1, counter);
                    }).then(done, done);
                });
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            })
        })
        
        describe('beforeAdd event on association', () => {
            it('on association.setTarget() with a new record', function (done) {
                let model = new Model({id: 2});
                let parent = new Parent({id: 24});
            
                model.association('parents').addEventListener('beforeAdd', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [undefined])
                    done()
                })
            
                model.parents = [parent];
            });
            
            it("not on association.setTarget() with a record already in the association", function (done) {
                let model = new Model({id: 2});
                let parent = new Parent({id: 24});
                model.parents = [parent]
                
                parent.addEventListener('beforeAdd', association => {
                    assert.ok(false)
                })
                
                model.parents = [parent]
                done()
            });
            
            it('on association.setAttributes() with a new record', function (done) {
                let model = new Model({id: 2});
            
                model.association('parents').addEventListener('beforeAdd', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [undefined])
                    done()
                })
            
                model.parents.setAttributes([{id: 24}])
            });
        
            it("not on association.setAttributes() with a record already in the association", function (done) {
                let model = new Model({id: 2});
                let parent = new Parent({id: 24});
                model.parents = [parent]
                
                parent.addEventListener('afterAdd', association => {
                    assert.ok(false)
                })
                
                model.parents.setAttributes([{id: 24}])
                done()
            });
        })
        
        describe('afterAdd event on association', () => {
            it('on association.setTarget() with a new record', function (done) {
                let model = new Model({id: 2});
                let parent = new Parent({id: 24});
            
                model.association('parents').addEventListener('afterAdd', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [2])
                    done()
                })
            
                model.parents = [parent]
            });
            
            it("not on association.setTarget() with a record already in the association", function (done) {
                let model = new Model({id: 2});
                let parent = new Parent({id: 24});
                model.parents = [parent]
                
                parent.addEventListener('afterAdd', association => {
                    assert.ok(false)
                })
                
                model.parents = [parent]
                done()
            });
            
            it('on association.setAttributes() with a new record', function (done) {
                let model = new Model({id: 2});
            
                model.association('parents').addEventListener('afterAdd', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [2])
                    done()
                })
            
                model.parents.setAttributes([{id: 24}])
            });
        
            it("not on association.setAttributes() with a record already in the association", function (done) {
                let model = new Model();
                let parent = new Parent({id: 24});
                model.parents = [parent]
                
                parent.addEventListener('afterAdd', association => {
                    assert.ok(false)
                })
                
                model.parents.setAttributes([{id: 24}])
                done()
            });
        })

        describe('beforeAdd event on association record', () => {
            it('on association.setTarget() with a new record', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [];

                parent.addEventListener('beforeAdd', association => {
                    assert.strictEqual(association.owner, model)
                    assert.equal(parent.readAttribute('model_id'), null)
                    done()
                })
            
                model.parents = [parent]
            });
            
            it("not on association.setTarget() with a record already in the association", () => {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('beforeAdd', association => {
                    assert.ok(false);
                })
            
                model.parents = [parent]
            });
            
            // it('on association.setAttributes() with a new record')
            // not applicable
            
            it("not on association.setAttributes() with a record already in the association", () => {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('beforeAdd', association => {
                    assert.ok(false);
                })
            
                model.parents.setAttributes([{id: 24}]);
            });
        });
        
        describe('afterAdd event on association record', () => {

            it('on association.setTarget() with a new record', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [];

                parent.addEventListener('afterAdd', association => {
                    assert.equal(association.owner, model)
                    assert.equal(parent.readAttribute('model_id'), 11)
                    done()
                })

                model.parents = [parent]
            });
            
            it("not on association.setTarget() with a record already in the association", () => {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('afterAdd', association => {
                    assert.ok(false);
                })
            
                model.parents = [parent]
            });
            
            // it('on association.setAttributes() with a new record')
            // not applicable
            
            it("not on association.setAttributes() with a record already in the association", () => {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('afterAdd', association => {
                    assert.ok(false);
                })
            
                model.parents.setAttributes([{id: 24}]);
            });
        });
        
        describe('beforeRemove event on association', () => {
            it('on association.setTarget()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                model.association('parents').addEventListener('beforeRemove', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [11])
                    done()
                })
            
                model.parents = []
            });
            
            it('on association.setAttributes()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                model.association('parents').addEventListener('beforeRemove', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [11])
                    done()
                })
            
                model.parents.setAttributes([])
            });
        });
        
        describe('afterRemove event on association', () => {
            it('on association.setTarget()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                model.association('parents').addEventListener('afterRemove', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [null])
                    done()
                })
            
                model.parents = []
            });
            
            it('on association.setAttributes()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                model.association('parents').addEventListener('afterRemove', records => {
                    assert.deepEqual(records.map(r => r.readAttribute('id')), [24])
                    assert.deepEqual(records.map(r => r.readAttribute('model_id')), [null])
                    done()
                })
            
                model.parents.setAttributes([])
            });
        });
        
        describe('beforeRemove event on association record', () => {
            it('on association.setTarget()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('beforeRemove', association => {
                    assert.equal(association.owner, model)
                    assert.equal(parent.readAttribute('model_id'), 11)
                    done()
                })
            
                model.parents = []
            });
            
            it('on association.setAttributes()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('beforeRemove', association => {
                    assert.equal(association.owner, model)
                    assert.equal(parent.readAttribute('model_id'), 11)
                    done()
                })
            
                model.parents.setAttributes([])
            });
        });
        
        describe('afterRemove event on association record', () => {
            it('on association.setTarget()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('afterRemove', association => {
                    assert.equal(association.owner, model)
                    assert.equal(parent.readAttribute('model_id'), null)
                    done()
                })

                model.parents = []
            });
            
            it('on association.setAttributes()', function (done) {
                let model = new Model({id: 11});
                let parent = new Parent({id: 24});
                model.parents = [parent];

                parent.addEventListener('afterRemove', association => {
                    assert.equal(association.owner, model)
                    assert.equal(parent.readAttribute('model_id'), null)
                    done()
                })
            
                model.parents.setAttributes([])
            });
        });
    });
});