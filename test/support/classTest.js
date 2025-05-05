import 'mocha';
import * as assert from 'assert';
import { extendClass } from 'viking/support/class';

describe('VikingSupport.Class', () => {

    it('#extendClass()', () => {
        function Boat () {}
        Boat.prototype.alpha = 'test'

        function Ship () {}
        extendClass('Ship', Boat, Ship, {}, { beta: 'test2' })
        
        function Battleship () {}
        extendClass('Battleship', Ship, Battleship)

        const battleship = new Battleship()
        assert.equal('test', battleship.alpha)
        assert.equal('test2', battleship.beta)
    });
    
    it('#extendClass() out of order', () => {
        function Boat () {}
        Boat.prototype.alpha = 'test'
        
        function Battleship () {}
        extendClass('Battleship', Ship, Battleship)

        function Ship () {}
        extendClass('Ship', Boat, Ship, {}, { beta: 'test2' })

        const battleship = new Battleship()
        assert.equal('test', battleship.alpha)
        assert.equal('test2', battleship.beta)
    });

});