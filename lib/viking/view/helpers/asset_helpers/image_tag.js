// Returns an HTML image tag for the +source+. The +source+ can be a full
// path or a file.
//
// ==== Options
//
// You can add HTML attributes using the +options+. The +options+ supports
// two additional keys for convenience and conformance:
//
// * <tt>:alt</tt>  - If no alt text is given, the file name part of the
//   +source+ is used (capitalized and without the extension)
// * <tt>:size</tt> - Supplied as "{Width}x{Height}" or "{Number}", so "30x45" becomes
//   width="30" and height="45", and "50" becomes width="50" and height="50".
//   <tt>:size</tt> will be ignored if the value is not in the correct format.
//
// ==== Examples
//
//   imageTag("/assets/icon.png")
//   // => <img alt="Icon" src="/assets/icon.png">
//   imageTag("/assets/icon.png", {size: "16x10", alt: "A caption"})
//   // => <img src="/assets/icon.png" width="16" height="10" alt="A caption">
//   imageTag("/icons/icon.gif", size: "16")
//   // => <img src="/icons/icon.gif" width="16" height="16" alt="Icon">
//   imageTag("/icons/icon.gif", height: '32', width: '32')
//   // => <img alt="Icon" height="32" src="/icons/icon.gif" width="32">
//   imageTag("/icons/icon.gif", class: "menu_icon")
//   // => <img alt="Icon" class="menu_icon" src="/icons/icon.gif">

Viking.View.Helpers.imageTag = function(source, options) {
    var options = options || {};
    var separator = /x/i;
    var size;
    var alt;

    options.src = source || options.src;

    if (options.size) {
        size = options.size.search(separator) > 0 ? options.size.split(separator) : [options.size, options.size];
        delete options.size;
        options.width = size[0];
        options.height = size[1];
    }

    if (!options.alt) {
        alt = options.src.replace(/^.*[\\\/]/, '').split(/\./)[0];
        alt = alt.charAt(0).toUpperCase() + alt.slice(1);
        options.alt = alt;
    }

    return Viking.View.Helpers.tag('img', options);
};
