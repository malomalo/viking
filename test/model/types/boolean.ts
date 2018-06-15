import * as assert from 'assert';
import 'mocha';
import * as _ from 'lodash';
import {BooleanType} from '../../../src/viking/model/types/boolean';

describe('Viking.Model.Types', () => {
    describe('Boolean', () => {

        it("::load coerces the string 'true' to true", function() {
            assert.strictEqual(
                BooleanType.load("true"),
                true
            );
        });

        it("::load coerces the string 'false' to false", function() {
            assert.strictEqual(
                BooleanType.load("false"),
                false
            );
        });

        it("::load coerces true to true", function() {
            assert.strictEqual(
                BooleanType.load(true),
                true
            );
        });

        it("::load coerces false to false", function() {
            assert.strictEqual(
                BooleanType.load(false),
                false
            );
        });

        it("::dump true", function() {
            assert.strictEqual(
                BooleanType.dump(true),
                true
            );
        });

        it("::dump false", function() {
            assert.strictEqual(
                BooleanType.dump(false),
                false
            );
        });

    });
});