module("Date");

test("strftime", function() {
    var d = new Date(1363904818448);
    
    // TODO: turns out timezone in javascript are nonexist, well existent
    // but untouchable and any date you create is in the loacle timezone,
    // so this test fails when adding %Z on a server set to a timezone
    // other than PDT, also %I
    // equal(d.strftime('%A %I %-m %Y %Z'), 'Thursday 03 3 2013 PDT');
    equal(d.strftime('%A %-m %Y'), 'Thursday 3 2013');
});
