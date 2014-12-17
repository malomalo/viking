(function () {
    module("Viking.View.Helpers#time_tag");

    // // timeTag(date, [options], [value])
    // // =================================
    test("timeTag(date)", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date), '<time datetime="2014-03-21T22:30:25.655Z">'+date.toString()+'</time>');
    });
    
    test("timeTag(date, content)", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date, 'Yesterday'), '<time datetime="2014-03-21T22:30:25.655Z">Yesterday</time>');
    });
    
    test("timeTag(date, options, content)", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date, {item: 'two'}, 'Yesterday'), '<time datetime="2014-03-21T22:30:25.655Z" item="two">Yesterday</time>');
    });
    
    test("timeTag(date, {pubdate: true})", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date, {pubdate: true}), '<time datetime="2014-03-21T22:30:25.655Z" pubdate>'+date.toString()+'</time>');
    });
    
    test("timeTag(date, {datetime: 'myvalue'})", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date, {datetime: 'myvalue'}), '<time datetime="myvalue">'+date.toString()+'</time>');
    });
    
    test("timeTag(date, contentFunc)", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date, function() { return 'data'; }), '<time datetime="2014-03-21T22:30:25.655Z">data</time>');
    });
    
    test("timeTag(date, options, contentFunc)", function() {
        var date = new Date(1395441025655);
        
        equal(Viking.View.Helpers.timeTag(date, {item: 'two'}, function() { return 'data'; }), '<time datetime="2014-03-21T22:30:25.655Z" item="two">data</time>');
    });
    
}());