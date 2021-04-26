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

    });
});
