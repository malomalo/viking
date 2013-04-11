module("Ext.Date");

test("strftime", function() {
    var d = new Date(1363904818448);
    
    equal(d.strftime('%A %I %m %Y %Z'), 'Thursday 03 03 2013 PDT');
});

test("strftimeUTC", function() {
    var d = new Date(1363904818448);
    
    equal(d.strftimeUTC('%A %I %-m %Y %Z'), 'Thursday 10 3 2013 GMT');
});