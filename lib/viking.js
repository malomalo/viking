//= require viking/preamble
//= require viking/errors
//= require viking/support
//= require viking/sync
//= require viking/model
//= require viking/collection
//= require viking/view
//
// TODO: move paginated_collection to a plugin
//= require viking/paginated_collection
//= require viking/controller
//= require viking/predicate
//= require viking/cursor
//= require viking/router
//= require viking/lib/msgpack.js

function bin2String(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    if (array[i] >= 48 && array[i] <= 57) {
        result.push(String.fromCharCode(array[i]));
    } else if (array[i] >= 65 && array[i] <= 90) {
        result.push(String.fromCharCode(array[i]));
    } else if (array[i] >= 97 && array[i] <= 122) {
        result.push(String.fromCharCode(array[i]));
    } else if (array[i] == 32 || array[i] == 45 || array[i] == 46 || array[i] == 95 || array[i] == 126) {
        result.push(String.fromCharCode(array[i]));
    } else {
        result.push('%' + ('00' + (array[i]).toString(16)).slice(-2).toUpperCase());
    }
  }

  return result.join("");
}

var MsgPackCodec = msgpack.createCodec({
    useraw: true
});
MsgPackCodec.addExtPacker(0x01, Date, function(date) {
    return date.toISOString();
});
MsgPackCodec.addExtUnpacker(0x01, function(date) {
    return Date.parse(date);
});