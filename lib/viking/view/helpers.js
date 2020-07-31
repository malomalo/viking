import {
    addErrorClassToOptions,
    dataTagOption,
    methodOrAttribute,
    sanitizeToId,
    tag,
    tagOption,
    tagOptions,
    render,
    tagNameForModelAttribute,
    imageTag
} from 'viking/view/helpers/tagHelpers';

import {
    buttonTag,
    checkBoxTag,
    colorFieldTag,
    contentTag,
    formTag,
    hiddenFieldTag,
    labelTag,
    numberFieldTag,
    optionsForSelectTag,
    optionsFromCollectionForSelectTag,
    passwordFieldTag,
    radioButtonTag,
    selectTag,
    submitTag,
    textAreaTag,
    textFieldTag,
    timeTag
} from './helpers/formTagHelpers';

import {
    checkBox,
    checkBoxGroup,
    collectionSelect,
    colorField,
    formFor,
    hiddenField,
    label,
    moneyField,
    numberField,
    passwordField,
    radioButton,
    select,
    textArea,
    textField
} from './helpers/formHelpers';

import {
    distanceOfTimeInWords
} from './helpers/dateHelpers';

import {
    linkTo,
    mailTo,
    urlFor
} from './helpers/urlHelpers';

export const Helpers = {

    addErrorClassToOptions,
    buttonTag,
    checkBox,
    checkBoxGroup,
    checkBoxTag,
    collectionSelect,
    colorField,
    colorFieldTag,
    contentTag,
    dataTagOption,
    distanceOfTimeInWords,
    formFor,
    formTag,
    hiddenField,
    hiddenFieldTag,
    imageTag,
    label,
    labelTag,
    linkTo,
    mailTo,
    moneyField,
    numberField,
    numberFieldTag,
    optionsForSelectTag,
    optionsFromCollectionForSelectTag,
    passwordField,
    passwordFieldTag,
    radioButton,
    radioButtonTag,
    render,
    sanitizeToId,
    select,
    selectTag,
    submitTag,
    tag,
    tagNameForModelAttribute,
    tagOption,
    tagOptions,
    templates: {},
    textArea,
    textAreaTag,
    textField,
    textFieldTag,
    timeAgoInWords: distanceOfTimeInWords,
    timeTag,
    urlFor
};
