// distanceOfTimeInWords(fromTime)
// distanceOfTimeInWords(fromTime, options)
// distanceOfTimeInWords(fromTime, toTime)
// distanceOfTimeInWords(fromTime, toTime, options)
// ================================================
//
// Reports the approximate distance in time between two Date objects. If only
// fromTime is given, toTime defaults to now
//
// Pass +includeSeconds: true+ if you want more detailed approximations
// when distance < 1 min, 29 secs.
//
// Distances are reported based on the following table:
//
//   0 secs <-> 1 min, 29 secs                                                  # => a minute
//   1 min, 30 secs <-> 59 mins, 29 secs                                        # => [2..59] minutes
//   59 mins, 30 secs <-> 1 hr, 29 mins, 59 secs                                # => an hour
//   1 hr, 30 mins, 0 secs <-> 23 hrs, 29 mins, 59 secs                         # => [2..23] hours
//   23 hrs, 30 mins, 0 secs <-> 1 day, 11 hrs, 59 mins, 59 secs                # => a day
//   1 day, 12 hrs, 0 mins, 0 secs <-> 29 days, 11 hrs, 59 mins, 59 secs        # => [2..29] days
//   29 days, 12 hrs, 0 mins, 0 secs <-> 44 days, 23 hrs, 59 mins, 59 secs       # => a month
//   45 days, 0 hrs, 0 mins, 0 secs <-> 1 yr minus 1 sec                        # => [2..12] months
//   1 yr <-> 1 yr, 3 months                                                    # => a year
//   1 yr, 3 months <-> 1 yr, 9 months                                          # => over a year
//   1 yr, 9 months <-> 2 yr minus 1 sec                                        # => almost 2 years
//   2 yrs <-> max time or date                                                 # => (same rules as 1 yr)
//
// With <tt>includeSeconds: true</tt> and the difference < 1 minute 29 seconds:
//   0-1   secs      # => a second
//   2-9   secs      # => [1..9] seconds
//   10-54 secs      # => [10,20...50] seconds
//   55-89 secs      # => a minute
//
//   fromTime = new Date()
//   distanceOfTimeInWords(fromTime, fromTime + 50.minutes)                                # => about 1 hour
//   distanceOfTimeInWords(fromTime, 50.minutes.from_now)                                   # => about 1 hour
//   distanceOfTimeInWords(fromTime, fromTime + 15.seconds)                                # => less than a minute
//   distanceOfTimeInWords(fromTime, fromTime + 15.seconds, include_seconds: true)         # => less than 20 seconds
//   distanceOfTimeInWords(fromTime, 3.years.from_now)                                      # => about 3 years
//   distanceOfTimeInWords(fromTime, fromTime + 60.hours)                                  # => 3 days
//   distanceOfTimeInWords(fromTime, fromTime + 45.seconds, include_seconds: true)         # => less than a minute
//   distanceOfTimeInWords(fromTime, fromTime - 45.seconds, include_seconds: true)         # => less than a minute
//   distanceOfTimeInWords(fromTime, 76.seconds.from_now)                                   # => 1 minute
//   distanceOfTimeInWords(fromTime, fromTime + 1.year + 3.days)                           # => about 1 year
//   distanceOfTimeInWords(fromTime, fromTime + 3.years + 6.months)                        # => over 3 years
//   distanceOfTimeInWords(fromTime, fromTime + 4.years + 9.days + 30.minutes + 5.seconds) # => about 4 years
//
//   toTime = Time.now + 6.years + 19.days
//   distanceOfTimeInWords(fromTime, toTime, include_seconds: true)                        # => about 6 years
//   distanceOfTimeInWords(toTime, fromTime, include_seconds: true)                        # => about 6 years
//   distanceOfTimeInWords(Time.now, Time.now)                                               # => less than a minute
export const distanceOfTimeInWords = function (fromTime, toTime, options) {
    let tmp;
    
    if (!(toTime instanceof Date)) {
        options = toTime;
        toTime = new Date();
    }
    
    options = _.extend({}, options);
    
    if ( fromTime > toTime ) {
        tmp = fromTime;
        fromTime = toTime;
        toTime = tmp;
    }
    
    let distance_in_seconds = Math.round((toTime.getTime() - fromTime.getTime()) / 1000);
    let distance_in_minutes = Math.round(distance_in_seconds / 60);

    if (distance_in_seconds <= 60) {
        if ( options.includeSeconds ) {
            if (distance_in_seconds < 2) {
                return "a second";
            } else if (distance_in_seconds < 10) {
                return distance_in_seconds + " seconds";
            } else if (distance_in_seconds < 55) {
                return (Math.round(distance_in_seconds/10)*10) + " seconds";
            } else {
                return "a minute";
            }
        } else {
            return "a minute";
        }
    } else if (distance_in_seconds < 90) {
        return "a minute";
    } else if (distance_in_seconds < (59*60) + 30) {
        return distance_in_minutes + " minutes";
    } else if (distance_in_seconds < (1*3600) + (30*60)) {
        return "an hour";
    } else if (distance_in_seconds < (23*3600) + (30*60)) { // Less than 23.5 Hours
        return Math.round(distance_in_seconds / 3600) + " hours"
    } else if (distance_in_seconds < (36*3600)) { // Less than 36 Hours
        return "a day";
    } else if (distance_in_seconds < (29*86400) + (12*3600)) { // Less than 29.5 Days
        return Math.round(distance_in_seconds / 86400) + " days"
    } else if (distance_in_seconds < (45*86400)) { // Less than 45 Days
        return "a month";
    } else if (distance_in_seconds < (365*86400)) { // Less than 365 Days
        return Math.round(distance_in_seconds / (30*86400)) + " months"
    } else {
        // 1 year = 525949 min
        // 1 leap year = 527040 min
        // for out calculations 400 year = 97 leap years + 303 years
        // 1 year ~= (525949 * 303 + 527040 * 97) / 400 = 526213.5675 min
        let years = Math.round((distance_in_minutes / 526213.5675)*100)/100;
        let partial_years = Math.round(years % 1 * 100) / 100;
        if (years < 1 || partial_years < 0.33) {
            years = Math.round(years);
            if (years == 1) { 
                return "a year";
            } else {
                return years + " years";
            }
        } else if (partial_years < 0.66) {
            years = Math.floor(years);
            if (years == 1) { 
                return "over a year";
            } else {
                return "over " + years + " years";
            }
        } else {
            years = Math.floor(years);
            return "almost " + (years+1) + " years";
        }
    }
};

export const timeAgoInWords = distanceOfTimeInWords;
