import contentTag from './content_tag';

// labelTag(content, options)
// ========================================================
//
// Creates a label element. Accepts a block.
//
// Options - Creates standard HTML attributes for the tag.
//
// Examples
// --------
//   labelTag('Name')
//   // => <label>Name</label>
//   
//   labelTag('name', 'Your name')
//   // => <label for="name">Your name</label>
//   
//   labelTag('name', nil, {for: 'id'})
//   // => <label for="name" class="small_label">Name</label>
export const labelTag = function (content, options, escape) {
    let tmp;

    if (typeof options === 'function') {
        tmp = content;
        content = options;
        options = tmp;
    }

    return contentTag('label', content, options, escape);
};

export default labelTag;
