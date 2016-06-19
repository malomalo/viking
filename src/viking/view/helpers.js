//= require viking/view/helpers/form_tag_helpers
//= require viking/view/helpers/builders
//= require viking/view/helpers/date_helpers
//= require viking/view/helpers/form_helpers
//= require viking/view/helpers/url_helpers
//= require viking/view/helpers/asset_helpers
//= require viking/view/helpers/render_helper

import { imageTag } from './helpers/asset_helpers/image_tag';

import {
    CheckBoxGroupBuilder, FormBuilder
} from './helpers/builders';

import {
    textField
} from './helpers/form_helpers';

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
    // Asset Helpers
    imageTag: imageTag,

    // Builders
    CheckBoxGroupBuilder: CheckBoxGroupBuilder,
    FormBuilder: FormBuilder,

    // Form Helpers
    textField: textField,

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

    // Render
    render: render
}

export default Helpers;
export * from './helpers/utils';
export * from './helpers/form_tag_helpers';
