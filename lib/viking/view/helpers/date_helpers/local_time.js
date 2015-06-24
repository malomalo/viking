// localTime(time)
// localTime(time, options)
// localTime(time, format)
// localTime(time, format, options)
// ================================
//
// Returns a html time tag for the given date or time in.
//
//   localTime(time)
//
// renders
//
//   <time data-format="%B %e, %Y %l:%M%P"
//         data-local="time"
//         datetime="2013-11-27T23:43:22Z"
//         title="November 27, 2013 6:43pm EDT"
//         data-localized="true">November 27, 2013 6:43pm</time>
//
// You can pass the format as the second option
//
//   localTime(time, '%B %e, %Y %l:%M%P')
//
// If you just need the date localDate is an alias for
//
//   localTime(time, '%B %e, %Y')
//
// To set attributes on the time tag, pass a hash as the second argument with a 
// :format key and your attributes.
//
//   localTime(time, {format: '%B %e, %Y %l:%M%P', class: 'my-time'})
Viking.View.Helpers.localTime = function (time, format, options) {
    if (typeof format === 'object') {
        options = format;
        format = undefined;
    }
    
    if (!format) {
        format = '%B %e, %Y %l:%M%P';
    }
    
    return Viking.View.Helpers.timeTag(time, {
        'data-format': format,
        'data-local':  'time',
        'title': time.strftime("%B %e, %Y at %l:%M%P %Z"),
        'data-localized': 'true'
    }, time.strftime(format));
};

// localDate(time)
// localDate(time, options)
// localDate(time, format)
// localDate(time, format, options)
// ================================
//
// An alias for +localTime(time, '%B %e, %Y')+
Viking.View.Helpers.localDate = function (time, format, options) {
    if (typeof format === 'object') {
        options = format;
        format = undefined;
    }
    
    if (!format) {
        format = '%B %e, %Y';
    }

    return Viking.View.Helpers.localTime(time, format, options)
};

// localTimeAgo(time)
// ==================
//
// Displays the relative amount of time passed. With age, the descriptions
// transition from {quantity of seconds, minutes, or hours} to {months, and years}
// The <time> elements are updated every 60 seconds. For examples see
// +Viking.View.Helpers.distanceOfTimeInWords+.
Viking.View.Helpers.localTimeAgo = function (time) {
    
};

// localRelativeTime(time)
// localRelativeTime(time, options)
// localRelativeTime(time, type)
// localRelativeTime(time, type, options)
// ======================================
//
// Preset time and date formats that vary with age. The available types are date,
// time-ago, time-or-date, and weekday-or-date. Similar to localTimeAgo the time
// elements get updated every 60 seconds.
//
// Types:
// - date: Includes the year unless it's current. "Apr 11" or "Apr 11, 2013"
// - time-ago: See +localTimeAgo+, +localTimeAgo+ call this with type 'time-ago'
// - time-or-date: Displays the time if it occurs today or the date if not. 
//                 "3:26pm" or "Apr 11"
// - weekday-or-date: Displays "Today", "Yesterday", the weekday (e.g. Wednesday)
//                    if the time is within a week of today. Otherwise displays
//                    the date.
Viking.View.Helpers.localRelativeTime = function (time, type, options) {
    if (typeof format === 'object') {
        options = type;
        type = options.type;
    }

    return Viking.View.Helpers.timeTag(time, {
        'data-local':  type,
        'title': time.strftime("%B %e, %Y at %l:%M%P %Z")
    }, timeToRelativeTime(time));
}

function formatTime(time, type) {
    if ( type === 'time-ago' ) {
        return Viking.View.Helpers.distanceOfTimeInWords(time);
    } else if ( type == 'date' ) {
        
    } else if ( type === 'time-or-date' ) {
        if (time.isToday() ) {
            return time.strftime('%l:%M%P');
        } else {
            if (time.isThisYear()) {
                return time.strftime('%b %e');
            } else {
                return time.strftime('%b %e, %Y');
            }
        }
    } else if ( type === 'weekday-or-date' ) {
        if (time.isToday()) {
            return 'Today';
        } else if (time > 2.days.ago()) {
            return 'Yesterday';
        } else if (time > 6.days.ago()) {
            return time.strftime('%A');
        } else {
            if (time.isThisYear()) {
                return time.strftime('%b %e');
            } else {
                return time.strftime('%b %e, %Y');
            }
        }
    }
}