import assert from 'assert';
import Model from 'viking/record';

describe('Viking.Record::modelName', () => {

    it('Object.prototype properties are overridden by attributes', () => {
        class Player extends Model {}
        class Team extends Model {}
        class Conference extends Model {}
        class League extends Model {}
        
        Model.modelName()
        
        assert.deepEqual(
            ['players', 'teams', 'conferences', 'leagues'],
            [
                Player.modelName().routeKey,
                Team.modelName().routeKey,
                Conference.modelName().routeKey,
                League.modelName().routeKey
            ]
        )
    });
});

