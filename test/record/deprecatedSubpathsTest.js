import assert from 'assert';
import sinon from 'sinon';

import Name from 'viking/model/name';
import Type from 'viking/model/type';
import Types from 'viking/model/types';
import JSONType from 'viking/model/types/json';

describe('deprecated viking/record subpaths', () => {

    // Each case dynamically imports the old path so the deprecation warning
    // (emitted once per path during module evaluation) can be observed.
    const cases = [
        ['viking/record/name', Name],
        ['viking/record/type', Type],
        ['viking/record/types', Types],
        ['viking/record/types/json', JSONType]
    ];

    cases.forEach(([oldPath, current]) => {
        it(`${oldPath} re-exports the new location and warns`, async () => {
            const warn = sinon.stub(console, 'warn');
            try {
                const mod = await import(oldPath);
                assert.strictEqual(mod.default, current);
                assert.ok(
                    warn.getCalls().some(c => /deprecated/.test(c.args[0]) && c.args[0].includes(oldPath)),
                    `expected a deprecation warning for ${oldPath}`
                );
            } finally {
                warn.restore();
            }
        });
    });

});
