import assert from 'assert';
import Record from 'viking/record';

describe('Viking.Record', () => {
    describe('defaults', () => {

        it('include defaults in save', function () {
            class Defaulted extends Record {
                static schema = { one: {default: 1} };
            }

            const record = new Defaulted()
            record.save()

            assert.ok(this.findRequest('POST', '/defaulteds', {
                body: {
                    defaulted: {
                        one: 1
                    }
                }
            }));
        });

    });
});
