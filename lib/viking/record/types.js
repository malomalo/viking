import BooleanType  from 'viking/record/types/boolean';
import DateType     from 'viking/record/types/date';
import DateTimeType     from 'viking/record/types/datetime';
import JSONType     from 'viking/record/types/json';
import FloatType   from 'viking/record/types/float';
import IntegerType   from 'viking/record/types/integer';
import StringType   from 'viking/record/types/string';
import UUIDType   from 'viking/record/types/uuid';

export default {
    registry: {
        boolean: BooleanType,
        date: DateType,
        datetime: DateTimeType,
        json: JSONType,
        float: FloatType,
        integer: IntegerType,
        string: StringType,
        uuid: UUIDType
    }
};