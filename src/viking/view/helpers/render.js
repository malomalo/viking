import Helpers from '../helpers';

export const render = function (templatePath, locals) {
    let template = Viking.View.templates[templatePath];

    if (!locals) {
        locals = {};
    }

    if (template) {
        return template(_.extend(locals, Helpers));
    }

    throw new Error('Template does not exist: ' + templatePath);
};

export default render;