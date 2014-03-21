// timeTag(date, [options], [value])
// =================================
//
// Returns an html time tag for the given date or time.
//
// Examples
// --------
//
//   timeTag(Date.today)
//   // => <time datetime="2010-11-04">November 04, 2010</time>
//
//   timeTag(Date.now)
//   // => <time datetime="2010-11-04T17:55:45+01:00">November 04, 2010 17:55</time>
//
//   timeTag(Date.yesterday, 'Yesterday')
//   // => <time datetime="2010-11-03">Yesterday</time>
//
//   timeTag(Date.today, {pubdate: true})
//   // => <time datetime="2010-11-04" pubdate="pubdate">November 04, 2010</time>
//
//   timeTag(Date.today, {datetime: Date.today.strftime('%G-W%V')})
//   // => <time datetime="2010-W44">November 04, 2010</time>
//
//   time_tag(Date.now, function() {
//     return '<span>Right now</span>';
//   });
//   // => <time datetime="2010-11-04T17:55:45+01:00"><span>Right now</span></time>
Viking.View.Helpers.timeTag = function (date, content, options) {
    var tmp;

    // handle both (date, opts, func || str) and (date, func || str, opts)
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    }
    options || (options = {});
    
    if (!content) {
        content = options.format ? date.strftime(format) : date.toString()
    }
    if (options.format) delete options.format;
    if (!options.datetime) options.datetime = date.toISOString();
    

    return Viking.View.Helpers.contentTag('time', content, options);
};
