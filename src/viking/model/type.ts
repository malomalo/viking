import { BooleanType } from './types/boolean';
import { DateType } from './types/date';
import { JSONType } from './types/json';
import { NumberType } from './types/number';
import { StringType } from './types/string';

export const Type = {
    registry: {
        boolean: BooleanType,
        date: DateType,
        json: JSONType,
        number: NumberType,
        string: StringType
    }
};
