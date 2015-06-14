(function () {
    module("Viking.View.Helpers#distanceOfTimeInWords");
    
    function testRange(from, expectFrom, to, expectTo, options) {
        var fromTime = new Date();
        var toTime = new Date();

        toTime.setTime(fromTime.getTime() + from * 1000);
        equal(
            Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, options),
            expectFrom
        );
        
        toTime.setTime(fromTime.getTime() + to * 1000);
        equal(
            Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, options),
            expectTo
        );
    }

    // Test each type of function call
    test("distanceOfTimeInWords(now - 5 seconds)", function() {
        var from = new Date();
        from.setTime(from.getTime() - 5000);
        
        equal(
            Viking.View.Helpers.distanceOfTimeInWords(from),
            'a minute'
        );
    });
    
    test("distanceOfTimeInWords(fromTime, {includeSeconds: true})", function() {
        var from = new Date();
        var to = new Date();
        to.setTime(from.getTime() + 5000);
        
        equal(
            Viking.View.Helpers.distanceOfTimeInWords(from, to, {includeSeconds: true}),
            '5 seconds'
        );
    });
    
    test("distanceOfTimeInWords(fromTime, fromTime + 5.seconds)", function() {
        var from = new Date();
        var to = new Date();
        to.setTime(from.getTime() + 5000);
        
        equal(
            Viking.View.Helpers.distanceOfTimeInWords(from, to),
            'a minute'
        );
    });
    
    test("distanceOfTimeInWords(fromTime, fromTime + 5.seconds, {includeSeconds: true})", function() {
        var from = new Date();
        var to = new Date();
        to.setTime(from.getTime() + 5000);
        
        equal(
            Viking.View.Helpers.distanceOfTimeInWords(from, to, {includeSeconds: true}),
            '5 seconds'
        );
    });
    
    // Now test the input / output combos
    test("distanceOfTimeInWords output", function() {
        var fromTime = new Date();
        var toTime = new Date();

        //   0 secs <-> 1 min, 29 secs                                                  # => a minute
        toTime.setTime(fromTime.getTime() + 0);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a minute');
        
        toTime.setTime(fromTime.getTime() + (1).minutes() + (29).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a minute');

        //   1 min, 30 secs <-> 59 mins, 29 secs                                        # => [2..59] minutes
        toTime.setTime(fromTime.getTime() + (1).minutes() + (30).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 minutes');
        
        toTime.setTime(fromTime.getTime() + (59).minutes() + (29).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '59 minutes');
        
        //   59 mins, 30 secs <-> 1 hr, 29 mins, 59 secs                                # => an hour
        toTime.setTime(fromTime.getTime() + (59).minutes() + (30).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'an hour');
        
        toTime.setTime(fromTime.getTime() + (1).hour() + (29).minutes() + (59).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'an hour');
        
        //   1 hr, 30 mins, 0 secs <-> 23 hrs, 29 mins, 59 secs                         # => [2..23] hours
        toTime.setTime(fromTime.getTime() + (1).hour() + (30).minutes());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 hours');
        
        toTime.setTime(fromTime.getTime() + (23).hours() + (29).minutes() + (59).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '23 hours');

        //   23 hrs, 30 mins, 0 secs <-> 1 day, 11 hrs, 59 mins, 59 secs                # => a day
        toTime.setTime(fromTime.getTime() + (23).hours() + (30).minutes());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a day');
        
        toTime.setTime(fromTime.getTime() + (1).day() + (11).hours() + (59).minutes() + (59).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a day');

        //   1 day, 12 hrs, 0 mins, 0 secs <-> 29 days, 11 hrs, 59 mins, 59 secs        # => [2..29] days
        toTime.setTime(fromTime.getTime() + (1).day() + (12).hours());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 days');
        
        toTime.setTime(fromTime.getTime() + (29).days() + (11).hours() + (59).minutes() + (59).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '29 days');
        
        //   29 days, 12 hrs, 0 mins, 0 secs <-> 44 days, 23 hrs, 59 mins, 59 secs       # => a month
        toTime.setTime(fromTime.getTime() + (29).days() + (12).hours());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a month');
        
        toTime.setTime(fromTime.getTime() + (44).days() + (23).hours() + (59).minutes() + (59).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a month');
        
        //   45 days, 0 hrs, 0 mins, 0 secs <-> 1 yr minus 1 sec                        # => [2..12] months
        toTime.setTime(fromTime.getTime() + (45).days());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 months');
        
        toTime.setTime(fromTime.getTime() + (365).days() - (1).second());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '12 months');

        //   1 yr <-> 1 yr, 3 months                                                    # => a year
        var one_year = (526213.5675 * 60000);
        toTime.setTime(fromTime.getTime() + one_year);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a year');
        
        toTime.setTime(fromTime.getTime() + one_year * 1.32);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a year');
        
        //   1 yr, 3 months <-> 1 yr, 9 months                                          # => over a year
        toTime.setTime(fromTime.getTime() + one_year * 1.34);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'over a year');
        
        toTime.setTime(fromTime.getTime() + one_year * 1.65);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'over a year');
        
        //   1 yr, 9 months <-> 2 yr minus 1 sec                                        # => almost 2 years
        toTime.setTime(fromTime.getTime() + one_year * 1.66);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'almost 2 years');
        
        toTime.setTime(fromTime.getTime() + one_year * 1.99);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'almost 2 years');

        //   2 yrs <-> max time or date                                                 # => (same rules as 1 yr)
        toTime.setTime(fromTime.getTime() + one_year * 2);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 years');
        
        toTime.setTime(fromTime.getTime() + one_year * 2.7);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'almost 3 years');
    });
    
    // Now test the input / output combos
    test("distanceOfTimeInWords output with includeSeconds option", function() {
        var fromTime = new Date();
        var toTime = new Date();
        
        //   0-1   secs      # => a second
        toTime.setTime(fromTime.getTime() + 0);
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), 'a second');
        
        toTime.setTime(fromTime.getTime() + (1).second());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), 'a second');
        
        //   2-9   secs      # => [1..9] seconds
        toTime.setTime(fromTime.getTime() + (2).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), '2 seconds');
        
        toTime.setTime(fromTime.getTime() + (9).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), '9 seconds');
        
        //   10-54 secs      # => [10,20...50] seconds
        toTime.setTime(fromTime.getTime() + (10).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), '10 seconds');
        
        toTime.setTime(fromTime.getTime() + (54).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), '50 seconds');
        
        //   55-89 secs      # => a minute
        toTime.setTime(fromTime.getTime() + (55).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), 'a minute');
        
        toTime.setTime(fromTime.getTime() + (89).seconds());
        equal(Viking.View.Helpers.distanceOfTimeInWords(fromTime, toTime, {includeSeconds: true}), 'a minute');
    });
    
}());