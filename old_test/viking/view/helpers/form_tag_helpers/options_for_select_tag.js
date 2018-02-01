(function () {
    module("Viking.View.Helpers#options_for_select_tag");

    // // optionsForSelectTag(container[, selected])
    // // ==========================================
    test("optionsForSelectTag(simple_array)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard"]),
               "<option>VISA</option>\n<option>MasterCard</option>"
        );
    });
    
    test("optionsForSelectTag(tuple_array)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]]),
               '<option value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
        );
    });
    
    test("optionsForSelectTag(hash)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag({"Dollar": "$", "Kroner": "DKK"}),
               '<option value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
        );
    });
    
    test("optionsForSelectTag(simple_array, selected)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard"], 'MasterCard'),
               "<option>VISA</option>\n<option selected>MasterCard</option>"
        );
    });
    
    test("optionsForSelectTag(tuple_array, selected)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]], '$'),
               '<option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
        );
    });
    
    test("optionsForSelectTag(hash, selected)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag({ "Basic": "$20", "Plus": "$40" }, "$40"),
               '<option value="$20">Basic</option>\n<option selected value="$40">Plus</option>'
        );
    });
    
    test("optionsForSelectTag(simple_array, multipleSelected)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], ['VISA', 'MasterCard']),
               "<option selected>VISA</option>\n<option selected>MasterCard</option>\n<option>Discover</option>"
        );
    });
    
    test("optionsForSelectTag(tuple_array, multipleSelected)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"], ["Ruble", "RUB"]], ['$', 'RUB']),
               '<option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option>\n<option selected value="RUB">Ruble</option>'
        );
    });
    
    test("optionsForSelectTag(hash, multipleSelected)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag({ "Basic": "$20", "Plus": "$40", "Royalty": "$60" }, ["$40", "$60"]),
               '<option value="$20">Basic</option>\n<option selected value="$40">Plus</option>\n<option selected value="$60">Royalty</option>'
        );
    });
    
    test("optionsForSelectTag(simple_array_with_options)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag([ "Denmark", ["USA", {'class': 'bold'}], "Sweden" ]),
               '<option>Denmark</option>\n<option class="bold">USA</option>\n<option>Sweden</option>'
        );
    });
    
    test("optionsForSelectTag(tuple_array_with_options)", function() {
        equal( Viking.View.Helpers.optionsForSelectTag([["Dollar", "$", {'class':  'underscore'}], ["Kroner", "DKK"]]),
               '<option class="underscore" value="$">Dollar</option>\n<option value="DKK">Kroner</option>'
        );
    });
    
    test("optionsForSelectTag(simple_array, {disabled: string})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], {disabled: 'MasterCard'}),
               "<option>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
        );
    });
        
    test("optionsForSelectTag(simple_array, {disabled: []})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], {disabled: ['VISA', 'MasterCard']}),
               "<option disabled>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
        );
    });
    
    test("optionsForSelectTag(simple_array, {selected: string, disabled: string})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], {selected: 'VISA', disabled: 'MasterCard'}),
               "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
        );
    });
    
    test("optionsForSelectTag(simple_array, {selected: [], disabled: []})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], {selected: ['VISA'], disabled: ['MasterCard']}),
               "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
        );
    });
    
    test("optionsForSelectTag(hash, {selected: [], disabled: []})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag({"VISA": 'V', "MasterCard": "M"}, {selected: ['V'], disabled: ['M']}),
               '<option selected value="V">VISA</option>\n<option disabled value="M">MasterCard</option>'
        );
    });
    
    test("optionsForSelectTag(simple_array, {selected: func, disabled: func})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], {
                   selected: function(v) { return v === 'VISA'; },
                   disabled: function(v) { return v === 'MasterCard'; }
               }),
               "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>"
        );
    });
    
    test("optionsForSelectTag(hash, {selected: func, disabled: func})", function() {
        equal( Viking.View.Helpers.optionsForSelectTag({"VISA": 'V', "MasterCard": "M"}, {
                   selected: function(v) { return v === 'V'; },
                   disabled: function(v) { return v === 'M'; }
               }),
               '<option selected value="V">VISA</option>\n<option disabled value="M">MasterCard</option>'
        );
    });

}());