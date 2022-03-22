import 'mocha';
import * as assert from 'assert';
import Connection from 'viking/record/connection';

describe('Viking.Record', () => {
    describe('Connection', () => {

        it('Automatically add the CSRF token', function () {
            document.head.innerHTML = '<meta name="csrf-token" content="ETZaIMiq">';
            
            let connection = new Connection('http://example.com');
            connection.get('/');
            
            this.withRequest('GET', '/', {}, (xhr) => {
                assert.equal(xhr.requestHeaders['X-CSRF-Token'], "ETZaIMiq");
            });
        });
        
        describe('callbacks', () => {        
            it('success', function (done) {
                let connection = new Connection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    success: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    success: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    success: response => {
                        assert.equal(response.foo, 'bar');
                        assert.equal(counter, 0);
                        done()
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
            });
            
            it('complete', function (done) {
                let connection = new Connection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    complete: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        counter++;
                    }
                });            
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    complete: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        counter ++;
                    }
                });            
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    complete: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        assert.equal(counter, 2)
                        done()
                    }
                });            
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
            });
            
            it('invalid', function (done) {
                let connection = new Connection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    invalid: request => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    invalid: request => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    invalid: request => {
                        assert.equal(request.response, '{"foo": "bar"}');
                        assert.equal(counter, 0);
                        done()
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
            });
            
            it('error', function (done) {
                let connection = new Connection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    error: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    error: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    error: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        assert.equal(counter, 0);
                        done()
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
            });
            
            
        })

    });
});
