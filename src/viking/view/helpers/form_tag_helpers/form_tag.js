// formTag([options], [content])
// formTag([content], [options])
// =============================
//
// ==== Options
// * <tt>:action</tt> - The url the action of the form should be set to.
// * <tt>:multipart</tt> - If set to true, the enctype is set to "multipart/form-data".
// * <tt>:method</tt> - The method to use when submitting the form, usually either "get" or "post".
//   If "patch", "put", "delete", or another verb is used, a hidden input with name <tt>_method</tt>
//   is added to simulate the verb over post. The default is "POST". Only set if
//   :action is passed as an option.
//
// ==== Examples
//   formTag();
//   // => <form>
//
//   formTag({action: '/posts'});
//   // => <form action="/posts" method="post">
//
//   formTag({action: '/posts/1', method: "put"});
//   // => <form action="/posts/1" method="post"><input name="_method" type="hidden" value="put" />
//
//   formTag({action: '/upload', multipart: true});
//   // => <form action="/upload" method="post" enctype="multipart/form-data">
//
//   formTag({action: '/posts'}, function() {
//      return submitTag('Save');
//   });
//   // => <form action="/posts" method="post"><input type="submit" name="commit" value="Save" /></form>
Viking.View.Helpers.formTag = function (options, content) {
    var tmp, methodOverride = '';
    
    if (typeof options === 'function' || typeof options === 'string') {
        tmp = content;
        content = options;
        options = tmp;
    }
    options || (options = {});
    
    if (options.action && !options.method) {
        options.method = 'post';
    } else if (options.method && options.method !== 'get' && options.method !== 'post') {
        methodOverride = Viking.View.Helpers.hiddenFieldTag('_method', options.method);
        options.method = 'post';
    }
    
    if (options.multipart) {
        options.enctype = "multipart/form-data";
        delete options.multipart;
    }
    

    if(content !== undefined) {
        content = methodOverride + (typeof content === 'function' ? content() : content);

        return Viking.View.Helpers.contentTag('form', content, options, false);
    }

    return Viking.View.Helpers.tag('form', options, false) + methodOverride;
};