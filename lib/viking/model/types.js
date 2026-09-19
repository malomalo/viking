import BooleanType  from './types/boolean.js';
import DateType     from './types/date.js';
import DateTimeType from './types/datetime.js';
import JSONType     from './types/json.js';
import FloatType    from './types/float.js';
import IntegerType  from './types/integer.js';
import StringType   from './types/string.js';
import UUIDType     from './types/uuid.js';

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