Viking.View.Helpers.render = function (templatePath, locals) {
    var template = Viking.View.templates[templatePath];

    if (!locals) {
        locals = {};
    }

    if (template) {
        return template(_.extend(locals, Viking.View.Helpers));
    } else {
        throw new Error('Template does not exist: ' + templatePath);
    }
};
