(function () {
    module("jQuery.CSRF Token", {
        setup: function() {
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = _.bind(function(xhr) {
                this.requests.push(xhr);
            }, this);
        },
        teardown: function() {
            this.xhr.restore();
        }
    });

    test("$.ajax() sets the CSRF header when meta tag present", function() {
        var token = $('body').append('<meta content="token" name="csrf-token" />').children().last();
        $.ajax({url: '/', dataType: 'json'});
        equal(this.requests[0].requestHeaders['X-CSRF-Token'], 'token');
        token.remove();
    });

    test("$.ajax() doesn't set the CSRF header if meta tag not present", function() {
        $.ajax({url: '/', dataType: 'json'});
        equal(this.requests[0].requestHeaders['X-CSRF-Token'], undefined);
    });

}());