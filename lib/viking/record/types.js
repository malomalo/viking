import BooleanType  from 'viking/record/types/boolean';
import DateType     from 'viking/record/types/date';
import JSONType     from 'viking/record/types/json';
import NumberType   from 'viking/record/types/number';
import StringType   from 'viking/record/types/string';

export default {
    registry: {
        boolean: BooleanType,
        date: DateType,
        json: JSONType,
        number: NumberType,
        string: StringType
    }
};