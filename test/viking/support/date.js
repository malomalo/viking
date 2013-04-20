module("Date");

test("strftime", function() {
    var d = new Date(1363904818448);
    
    equal(d.strftime('%A %I %-m %Y %Z'), 'Thursday 03 3 2013 PDT');
});