// Deprecated: moved to 'viking/model/types'. This re-export shim will be removed
// in a future release.
import { deprecate } from '../support/deprecation.js';
deprecate('viking/record/types', 'viking/model/types');
export { default } from '../model/types.js';
