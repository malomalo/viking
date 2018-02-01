import {
    tag,
    tagOption,
    tagOptions,
    dataTagOption,
    sanitizeToId,
    tagNameForModelAttribute,
    addErrorClassToOptions,
    methodOrAttribute,
    render
} from './helpers/index';

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
} from './helpers/form_tags';

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
} from './helpers/form_helpers';

import {
    distanceOfTimeInWords
} from './helpers/date_helpers';

import {
    linkTo,
    mailTo
} from './helpers/url_helpers';

import { imageTag } from './helpers/asset_helpers/image_tag';



export const Helpers = {

    buttonTag,
    checkBox,
    checkBoxGroup,
    checkBoxTag,
    collectionSelect,
    colorField,
    colorFieldTag,
    contentTag,
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
    select,
    selectTag,
    submitTag,
    tag,
    templates: {},
    textArea,
    textAreaTag,
    textField,
    textFieldTag,
    timeAgoInWords: distanceOfTimeInWords,
    timeTag

}
