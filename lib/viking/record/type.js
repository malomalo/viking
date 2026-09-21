// Deprecated: moved to 'viking/model/type'. This re-export shim will be removed
// in a future release.
import { deprecate } from '../support/deprecation.js';
deprecate('viking/record/type', 'viking/model/type');
export { default } from '../model/type.js';
