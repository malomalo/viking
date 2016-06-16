//= require viking/view/helpers/form_tag_helpers
//= require viking/view/helpers/builders
//= require viking/view/helpers/date_helpers
//= require viking/view/helpers/form_helpers
//= require viking/view/helpers/url_helpers
//= require viking/view/helpers/asset_helpers
//= require viking/view/helpers/render_helper

import {
    tagOption, dataTagOption, tagOptions, sanitizeToId,
    tagNameForModelAttribute, addErrorClassToOptions,
    methodOrAttribute
} from './helpers/utils';

import {
    buttonTag,  checkBoxTag, contentTag, formTag, hiddenFieldTag, labelTag,
    numberFieldTag, optionsForSelectTag, optionsFromCollectionForSelectTag,
    passwordFieldTag, radioButtonTag, selectTag, submitTag, tag, textAreaTag,
    textFieldTag, timeTag
} from './helpers/form_tag_helpers';

import render from './helpers/render';

export const Helpers = {
    // Utils
    tagOption: tagOption,
    dataTagOption: dataTagOption,
    tagOptions: tagOptions,
    sanitizeToId: sanitizeToId,
    tagNameForModelAttribute: tagNameForModelAttribute,
    addErrorClassToOptions: addErrorClassToOptions,
    methodOrAttribute: methodOrAttribute,

    // Form Tag Helpers
    buttonTag: buttonTag,
    checkBoxTag: checkBoxTag,
    contentTag: contentTag,
    formTag: formTag,
    hiddenFieldTag: hiddenFieldTag,
    labelTag: labelTag,
    numberFieldTag: numberFieldTag,
    optionsForSelectTag: optionsForSelectTag,
    optionsFromCollectionForSelectTag: optionsFromCollectionForSelectTag,
    passwordFieldTag: passwordFieldTag,
    radioButtonTag: radioButtonTag,
    selectTag: selectTag,
    submitTag: submitTag,
    tag: tag,
    textAreaTag: textAreaTag,
    textFieldTag: textFieldTag,
    timeTag: timeTag,
    
    render: render
}

export default Helpers;
export * from './helpers/utils';
export * from './helpers/form_tag_helpers';
