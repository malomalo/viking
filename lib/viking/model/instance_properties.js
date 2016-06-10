export { coerceAttributes } from './instance_properties/coerceAttributes';
export { constructor } from './instance_properties/constructor';
export { defaults } from './instance_properties/defaults';
export { errorsOn } from './instance_properties/errorsOn';
export { paramRoot } from './instance_properties/paramRoot';
export { save } from './instance_properties/save';
export { select } from './instance_properties/select';
export { set } from './instance_properties/set';
export { setErrors } from './instance_properties/setErrors';
export { sync } from './instance_properties/sync';
export { toJSON } from './instance_properties/toJSON';
export { toParam } from './instance_properties/toParam';
export { touch } from './instance_properties/touch';
export { unselect } from './instance_properties/unselect';
export { updateAttribute } from './instance_properties/update_attribute';
export { updateAttributes } from './instance_properties/update_attributes';
export { url } from './instance_properties/url';
export { urlRoot } from './instance_properties/urlRoot';

export let abstract = true;

// inheritanceAttribute is the attirbute used for STI
export let inheritanceAttribute = 'type';
