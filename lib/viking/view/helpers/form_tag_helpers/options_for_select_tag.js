// optionsForSelectTag(container[, selected])
// =======================================
//
// Accepts a container (hash, array, collection, your type) and returns a
// string of option tags. Given a container where the elements respond to
// first and last (such as a two-element array), the "lasts" serve as option
// values and the "firsts" as option text. Hashes are turned into this
// form automatically, so the keys become "firsts" and values become lasts.
// If +selected+ is specified, the matching "last" or element will get the
// selected option-tag. +selected+ may also be an array of values to be
// selected when using a multiple select.
//
//   optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]])
//   // => <option value="$">Dollar</option>
//   // => <option value="DKK">Kroner</option>
//
//   optionsForSelectTag([ "VISA", "MasterCard" ], "MasterCard")
//   // => <option>VISA</option>
//   // => <option selected>MasterCard</option>
//
//   optionsForSelectTag({ "Basic" => "$20", "Plus" => "$40" }, "$40")
//   // => <option value="$20">Basic</option>
//   // => <option value="$40" selected>Plus</option>
//
//   optionsForSelectTag([ "VISA", "MasterCard", "Discover" ], ["VISA", "Discover"])
//   // => <option selected>VISA</option>
//   // => <option>MasterCard</option>
//   // => <option selected>Discover</option>
//
// You can optionally provide html attributes as the last element of the array.
//
//   optionsForSelectTag([ "Denmark", ["USA", {class: 'bold'}], "Sweden" ], ["USA", "Sweden"])
//   // => <option value="Denmark">Denmark</option>
//   // => <option value="USA" class="bold" selected>USA</option>
//   // => <option value="Sweden" selected>Sweden</option>
//
//   optionsForSelectTag([["Dollar", "$", {class: "bold"}], ["Kroner", "DKK", {class: "alert"}]])
//   // => <option value="$" class="bold">Dollar</option>
//   // => <option value="DKK" class="alert">Kroner</option>
//
// If you wish to specify disabled option tags, set +selected+ to be a hash,
// with <tt>:disabled</tt> being either a value or array of values to be
// disabled. In this case, you can use <tt>:selected</tt> to specify selected
// option tags.
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {disabled: "Super Platinum"})
//   // => <option value="Free">Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced">Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {disabled: ["Advanced", "Super Platinum"]})
//   // => <option value="Free">Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced" disabled>Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {selected: "Free", disabled: "Super Platinum"})
//   // => <option value="Free" selected>Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced">Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
// NOTE: Only the option tags are returned, you have to wrap this call in a
// regular HTML select tag.
Viking.View.Helpers.optionsForSelectTag = function (container, selected) {
    let disabled;
    let arrayWrap = function (data) {
        if (_.isArray(data)) { return data; }
        return [data];
    };

    
    if (typeof selected !== 'object' && typeof selected !== 'function') {
        selected = arrayWrap(selected);
    } else if (!_.isArray(selected) && typeof selected !== 'function') {
        disabled = typeof selected.disabled === 'function' ? selected.disabled : arrayWrap(selected.disabled);
        selected = typeof selected.selected === 'function' ? selected.selected : arrayWrap(selected.selected);
    }
    
    if(_.isArray(container)) {
        return _.map(container, function(text) {
            let value, options = {};
            if (_.isArray(text)) {
                if (typeof _.last(text) === 'object') { options = text.pop(); }
                if (text.length === 2) {
                    options.value = value = text[1];
                    text = text[0];
                } else {
                    value = text = text[0];
                }
            } else {
                value = text;
            }
            
            if(typeof selected === 'function') {
                if (selected(value)) { options.selected = true; }
            } else if(_.contains(selected, value)) {
                options.selected = true;
            }
            if(typeof disabled === 'function') {
                if (disabled(value)) { options.disabled = true; }
            } else if(_.contains(disabled, value)) {
                options.disabled = true;
            }
            
            return Viking.View.Helpers.contentTag('option', text, options);
        }).join("\n");
    }
    
    return _.map(container, function(value, text) {
        let options = {value: value};

        if(typeof selected === 'function') {
            if (selected(value)) { options.selected = true; }
        } else if(_.contains(selected, value)) {
            options.selected = true;
        }
        if(typeof disabled === 'function') {
            if (disabled(value)) { options.disabled = true; }
        } else if(_.contains(disabled, value)) {
            options.disabled = true;
        }
        
        return Viking.View.Helpers.contentTag('option', text, options);
    }).join("\n");
};
