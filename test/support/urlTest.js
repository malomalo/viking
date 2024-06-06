import 'mocha';
import * as assert from 'assert';
import {toParam} from 'viking/support';
import {parseSearchParams} from 'viking/support/url';

describe('VikingSupport.URL', () => {

    it('#parseSearchParams(basicParams)', () => {
        assert.deepEqual({x: '2'}, parseSearchParams('x=2'));
    });

    it('#parseSearchParams(nestedParams)', () => {
        assert.deepEqual({
            person: {
                age: '22',
                name: 'Francesco',
                pets: [
                    {category: 'dogs'},
                    {name: 'Purplish'}
                ]
            }
        }, parseSearchParams("person[age]=22&person[name]=Francesco&person[pets][][category]=dogs&person[pets][][name]=Purplish"));
    });

    it('#parseSearchParams(nestedArrays)', () => {
        assert.deepEqual({
            pets: [
                ['dogs'],
                ['Purplish']
            ]
        }, parseSearchParams("pets[][]=dogs&pets[][]=Purplish"));
    });
    
});

