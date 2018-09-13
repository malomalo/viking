import 'mocha';
import * as assert from 'assert';
import {toParam, toQuery} from 'viking/support/date';

describe('VikingSupport.Date', () => {

    // it("strftime", function () {
    //     var d = new Date(1363904818448);

    //     // TODO: turns out timezone in javascript are nonexist, well existent
    //     // but untouchable and any date you create is in the loacle timezone,
    //     // so this test fails when adding %Z on a server set to a timezone
    //     // other than PDT, also %I
    //     assert.equal(strftime(d, '%A %I %-m %Y %Z'), 'Thursday 03 3 2013 PDT');
    //     assert.equal(strftime(d, '%A %-m %Y'), 'Thursday 3 2013');
    // });

    it('#toParam()', () => {
        assert.equal('2013-03-21T22:26:58.448Z', toParam(new Date(1363904818448)));
    });

    it('#toQuery(key)', () => {
        assert.equal('key=2013-03-21T22:26:58.448Z', toQuery(new Date(1363904818448), 'key'));
    });

});