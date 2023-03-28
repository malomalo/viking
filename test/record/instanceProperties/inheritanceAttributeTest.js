import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';

describe('Viking.Record#inheritanceAttribute', () => {

    it("default to `type`", () => {
        class Ship extends VikingRecord { }
        let ship = new Ship();

        assert.equal('type', ship.inheritanceAttribute);
    });

    it("override", () => {
        class Ship extends VikingRecord {
            static inheritanceAttribute = 'class_name';
        }
        let ship = new Ship();

        assert.equal('class_name', ship.inheritanceAttribute);
    });

});