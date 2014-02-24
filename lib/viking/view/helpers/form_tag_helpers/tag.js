// tag(name, [options = {}, escape = true])
// ========================================
//
// Returns an empty HTML tag of type `name` add HTML attributes by passing
// an attributes hash to `options`. Set escape to `false` to disable attribute
// value escaping.
//
// Arguments
// ---------
// - Use `true` with boolean attributes that can render with no value, like `disabled` and `readonly`.
// - HTML5 data-* attributes can be set with a single data key pointing to a hash of sub-attributes.
// - Values are encoded to JSON, with the exception of strings and symbols.
//
// Examples
// --------
//
//   tag("br")
//   // => <br>
//
//   tag("input", {type: 'text', disabled: true})
//   // => <input type="text" disabled="disabled" />
//
//   tag("img", {src: "open & shut.png"})
//   // => <img src="open &amp; shut.png" />
//   
//   tag("img", {src: "open &amp; shut.png"}, false, false)
//   // => <img src="open &amp; shut.png" />
//   
//   tag("div", {data: {name: 'Stephen', city_state: ["Chicago", "IL"]}})
//   // => <div data-name="Stephen" data-city_state="[&quot;Chicago&quot;,&quot;IL&quot;]" />
Viking.View.Helpers.tag = function (name, options, escape) {
    return "<" + name + Viking.View.tagOptions(options, escape) + ">";
};