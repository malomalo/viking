module("Ext.Date");

test("strftime", function() {
    var d = new Date(1363904818448);
    
    equal('Thursday 03 3 2013 PDT', d.strftime('%A %I %N %Y %Z'));
});

test("strftimeUTC", function() {
    var d = new Date(1363904818448);
    
    equal('Thursday 10 3 2013 GMT', d.strftimeUTC('%A %I %N %Y %Z'));
});