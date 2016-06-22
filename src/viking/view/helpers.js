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
    timeAgoInWords, distanceOfTimeInWords,
    localTime, localDate, localTimeAgo, localRelativeTime, formatTime
} from './helpers/date_helpers';

import {
    checkBoxGroup, checkBox, collectionSelect, formFor, hiddenField, label,
    numberField, passwordField, radioButton, select, textArea, textField
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

import { linkTo, mailTo, urlFor } from './helpers/url_helpers';

export const Helpers = {
    // Asset Helpers
    imageTag: imageTag,

    // Builders
    CheckBoxGroupBuilder: CheckBoxGroupBuilder,
    FormBuilder: FormBuilder,

    // Date Helpers
    timeAgoInWords: timeAgoInWords,
    distanceOfTimeInWords: distanceOfTimeInWords,
    // localTime: localTime,
    // localDate: localDate,
    // localTimeAgo: localTimeAgo,
    // localRelativeTime: localRelativeTime,
    // formatTime: formatTime,
    
    // Form Helpers
    checkBoxGroup: checkBoxGroup,
    checkBox: checkBox,
    collectionSelect: collectionSelect,
    formFor: formFor,
    hiddenField: hiddenField,
    label: label,
    numberField: numberField,
    passwordField: passwordField,
    radioButton: radioButton,
    select: select,
    textArea: textArea,
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

    // URL Helpers
    linkTo: linkTo,
    mailTo: mailTo,
    urlFor: urlFor,

    // Render
    render: render
}

export default Helpers;
export * from './helpers/utils';
export * from './helpers/form_tag_helpers';
