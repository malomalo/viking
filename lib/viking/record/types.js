import BooleanType  from './types/boolean';
import DateType     from './types/date';
import DateTimeType from './types/datetime';
import JSONType     from './types/json';
import FloatType    from './types/float';
import IntegerType  from './types/integer';
import StringType   from './types/string';
import UUIDType     from './types/uuid';

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