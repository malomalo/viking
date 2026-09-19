// Deprecated: moved to 'viking/model/name'. This re-export shim will be removed
// in a future release.
import { deprecate } from '../support/deprecation.js';
deprecate('viking/record/name', 'viking/model/name');
export { default } from '../model/name.js';
