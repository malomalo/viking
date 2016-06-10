import DateType from './type/date';
import JSONType from './type/json';
import NumberType from './type/number';
import StringType from './type/string';
import BooleanType from './type/boolean';

const Type = {
    'registry': {}
};

Type.registry['date'] = Type.Date = DateType;
Type.registry['json'] = Type.JSON = JSONType;
Type.registry['number'] = Type.Number = NumberType;
Type.registry['string'] = Type.String = StringType;
Type.registry['boolean'] = Type.Boolean = BooleanType;

export default Type;
