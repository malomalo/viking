// optionsFromCollectionForSelectTag(collection, valueMethod, textMethod, selected)
// =============================================================================
//
// Returns a string of option tags that have been compiled by iterating over
// the collection and assigning the result of a call to the valueMethod as
// the option value and the textMethod as the option text.
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name')
//   // => <option value="person's id">person's name</option>
//
// This is more often than not used inside a selectTag like this example:
//
//   selectTag(person, optionsFromCollectionForSelectTag(people, 'id', 'name'))
//
// If selected is specified as a value or array of values, the element(s)
// returning a match on valueMethod will be selected option tag(s).
//
// If selected is specified as a Proc, those members of the collection that
// return true for the anonymous function are the selected values.
//
// selected can also be a hash, specifying both :selected and/or :disabled
// values as required.
//
// Be sure to specify the same class as the valueMethod when specifying
// selected or disabled options. Failure to do this will produce undesired
// results. Example:
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name', '1')
//
// Will not select a person with the id of 1 because 1 (an Integer) is not
// the same as ‘1’ (a string)
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name', 1)
//
// should produce the desired results.
Viking.View.Helpers.optionsFromCollectionForSelectTag = function(collection, valueAttribute, textAttribute, selected) {
    var selectedForSelect;
    
    var options = collection.map(function(model) {
        return [Viking.View.methodOrAttribute(model, textAttribute), Viking.View.methodOrAttribute(model, valueAttribute)];
    });
    
    if (_.isArray(selected)) {
        selectedForSelect = selected;
    } else if (typeof selected === 'object'){
        selectedForSelect = {
            selected: selected.selected,
            disabled: selected.disabled
        };
    } else {
        selectedForSelect = selected;
    }

    return Viking.View.Helpers.optionsForSelectTag(options, selectedForSelect);
};
