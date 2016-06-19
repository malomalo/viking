import Helpers from '../helpers';
import templates from '../templates';

export const render = function (templatePath, locals) {
    let template = templates[templatePath];

    if (!locals) {
        locals = {};
    }

    if (template) {
        return template(_.extend(locals, Helpers));
    }

    throw new Error('Template does not exist: ' + templatePath);
};

export default render;