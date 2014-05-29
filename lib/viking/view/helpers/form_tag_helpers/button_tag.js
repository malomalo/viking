// buttonTag(content, options), buttonTag(options, block)
// ========================================================
//
// Creates a button element that defines a submit button, reset button or a
// generic button which can be used in JavaScript, for example. You can use
// the button tag as a regular submit tag but it isn't supported in legacy
// browsers. However, the button tag allows richer labels such as images and
// emphasis.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   buttonTag("Button")
//   // => <button name="button" type="submit">Button</button>
//   
//   buttonTag("Checkout", { :disabled => true })
//   // => <button disabled name="button" type="submit">Checkout</button>
//   
//   buttonTag({type: "button"}, function() {
//      return "Ask me!";
//   });
//   // <button name="button" type="button"><strong>Ask me!</strong></button>
Viking.View.Helpers.buttonTag = function (content, options) {
    var tmp;

    // Handle `content, options` && `options` style arguments
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    } else if (options === undefined) {
        options = {}; 
    }

    _.defaults(options, {name: 'button', type: 'submit'});
    return Viking.View.Helpers.contentTag('button', content, options);
};
