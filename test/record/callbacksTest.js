import 'mocha';
import * as assert from 'assert';
import Record from 'viking/record';

describe('Viking.Record#callbacks', () => {
    
    describe('create', () => {
        class Actor extends Record {
            static schema = {
                score: {type: 'integer'}
            }
            
            static beforeCreate = [
                'startScore'
            ]
            
            static afterCreate = [
                'endScore'
            ]
            
            startScore () {
                this.score = 1
            }
            
            endScore () {
                this.score = 99
            }
        }
        it('before', function () {
            const model = new Actor();
            assert.equal(model.score, null)
            model.save()
            assert.ok(this.findRequest('POST', '/actors', {
                body: {
                    actor: {
                        score: 1
                    }
                }
            }));
        })
        
        it('not on save', function(done) {
            Actor.find(1).then(model => {
                model.score = 11
                model.save().then(() => {
                    assert.equal(model.score, 11)
                }).then(done, done)

                this.withRequest('PUT', '/actors/1', { body: {actor: {score: 11} } }, (xhr) => {
                    xhr.respond(201, {}, '{"id": 1, "score": 11}');
                });
            });
            this.withRequest('GET', '/actors', { params: {where: {id: 1}, order:{id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(201, {}, '[{"id": 1, "score": 1}]');
            });
        })

        it('after', function (done) {
            const model = new Actor();
            assert.equal(model.score, null)
            model.save().then(() => {
                assert.equal(model.score, 99)
            }).then(done, done)

            this.withRequest('POST', '/actors', { body: {actor: {score: 1} } }, (xhr) => {
                xhr.respond(201, {}, '{"id": 1, "score": 1}');
            });
        })
    })
    
    describe('save', async () => {
        class Actor extends Record {
            static schema = {
                score: {type: 'integer'}
            }
            
            static beforeSave = [
                'startScore'
            ]
            
            static afterSave = [
                'endScore'
            ]
            
            startScore () {
                this.score = 2
            }
            
            endScore () {
                this.score = 99
            }
        }
        
        it('before', function (done) {
            Actor.find(1).then(model => {
                model.score = 11
                assert.equal(model.score, 11)
                model.save()
                assert.ok(this.findRequest('PUT', '/actors/1', {
                    body: {
                        actor: {
                            score: 2
                        }
                    }
                }));
            }).then(done, done)
            this.withRequest('GET', '/actors', { params: {where: {id: 1}, order:{id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(201, {}, '[{"id": 1, "score": 1}]');
            });
        })

        it('after', function (done) {
            Actor.find(1).then(model => {
                model.score = 11
                assert.equal(model.score, 11)
                model.save().then(() => {
                    assert.equal(model.score, 99)
                }).then(done, done)
            
                this.withRequest('PUT', '/actors/1', { body: {actor: {score: 2} } }, (xhr) => {
                    xhr.respond(201, {}, '{"id": 1, "score": 2}');
                });
            })
            this.withRequest('GET', '/actors', { params: {where: {id: 1}, order:{id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(201, {}, '[{"id": 1, "score": 1}]');
            });
        })
    })
    
    describe('destroy', async () => {
        let beforeDestroyFlag = false;
        let afterDestroyFlag = false;
        
        class Actor extends Record {
            static schema = {
                score: {type: 'integer'}
            }
            
            static beforeDestroy = [
                'beforeDestroyFlag'
            ]
            
            static afterDestroy = [
                'afterDestroyFlag'
            ]
            
            beforeDestroyFlag () {
                beforeDestroyFlag = true
            }
            
            afterDestroyFlag () {
                afterDestroyFlag = true
            }
        }
        
        it('before', function (done) {
            Actor.find(1).then(model => {
                model.destroy()
                assert.ok(beforeDestroyFlag)
            }).then(done, done)
            this.withRequest('GET', '/actors', { params: {where: {id: 1}, order:{id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(201, {}, '[{"id": 1, "score": 1}]');
            });
        })

        it('after', function (done) {
            Actor.find(1).then(model => {
                model.destroy().then(() => {
                    assert.ok(afterDestroyFlag)
                }).then(done, done)
            
                this.withRequest('DELETE', '/actors/1', {}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 1, "score": 2}');
                });
            })
            this.withRequest('GET', '/actors', { params: {where: {id: 1}, order:{id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(201, {}, '[{"id": 1, "score": 1}]');
            });
        })
    })

});