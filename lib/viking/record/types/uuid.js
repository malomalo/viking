// Deprecated: moved to 'viking/model/types/uuid'. This re-export shim will be
// removed in a future release.
import { deprecate } from '../../support/deprecation.js';
deprecate('viking/record/types/uuid', 'viking/model/types/uuid');
export { default } from '../../model/types/uuid.js';
