(function () {
    module("Viking.Model::find", {
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

    test("::find returns an new model", function() {
        var Model = Viking.Model.extend('model');
				
				var m = Model.find(12);
				ok(m instanceof Model);
    });
		
    test("::find sends get request to correct url", function() {
        var Model = Viking.Model.extend('model');
				
				Model.find(12);
				equal(this.requests[0].method, 'GET');
				equal(this.requests[0].url, '/models/12');
    });
		
    test("::find triggers success callback", function() {
				expect(1);
				
        var Model = Viking.Model.extend('model');
				Model.find(12, {
					success: function(m) { equal(m.get('name'), "Viking"); }
				});
				this.requests[0].respond(200, '[]', '{"id": 12, "name": "Viking"}');
    });
		
    test("::find triggers error callback", function() {
				expect(1);
				
        var Model = Viking.Model.extend('model');
				Model.find(12, {
					error: function(m) { ok(true); }
				});
				this.requests[0].respond(500, '[]', 'Server Error!');
    });

}());