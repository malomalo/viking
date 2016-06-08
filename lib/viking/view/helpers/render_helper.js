Viking.View.Helpers.render = function (templatePath, locals) {
    let template = Viking.View.templates[templatePath];

    if (!locals) {
        locals = {};
    }

    if (template) {
        return template(_.extend(locals, Viking.View.Helpers));
    }

    throw new Error('Template does not exist: ' + templatePath);
};
