import * as _ from 'underscore';
import * as string from './string';

// Alias of to_s.
export const toParam = (v: boolean) => v.toString();

export function toQuery(key: string, value: boolean) {
	return _.escape(string.toParam(key) + "=" + _.escape(toParam(value)));
};
