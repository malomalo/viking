Viking.View.Helpers.render = function (templatePath, locals) {
    var template;

    if (templatePath) {
        template = Viking.View.templates[Viking.View.templateRoot + templatePath];

        if (!locals) {
            locals = {};
        }

        if (template) {
            return template(_.extend(locals, Viking.View.Helpers));
        } else {
            throw new Error('Template does not exist: ' + templatePath);
        }
    } else {
        throw new Viking.ArgumentError('Cannot render without template provided');
    }
};
