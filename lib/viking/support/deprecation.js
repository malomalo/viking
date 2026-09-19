// Tracks which deprecation messages have already been emitted so a warning
// fires at most once per process/page, no matter how many modules import a
// deprecated path.
const warned = new Set();

/**
 * Emits a one-time deprecation warning. Safe in both Node and the browser.
 *
 * @param {string} oldPath - The deprecated import path (e.g. 'viking/record/types')
 * @param {string} newPath - The replacement import path (e.g. 'viking/model/types')
 */
export function deprecate(oldPath, newPath) {
    if (warned.has(oldPath)) { return; }
    warned.add(oldPath);

    const message = `[viking] '${oldPath}' is deprecated and will be removed in a future release; import from '${newPath}' instead.`;
    if (typeof console !== 'undefined' && console.warn) {
        console.warn(message);
    }
}
