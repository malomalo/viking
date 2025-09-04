/**
 * @module Support.Inflector
 * @memberof Support
 * @ignore
 */

let plurals = []; //: [RegExp, string][]
let singulars = []; //: [RegExp, string][]
let uncountables = []; //: string[]

/**
 * `plural` creates a new pluralization rule for the inflector.
 * `rule` can be either a string or a regex.
 */
//
// export function addPluralRule(rule: RegExp, replacement: string)
export function addPluralRule(rule, replacement) {
    plurals.unshift([rule, replacement]);
}

/**
 * `singular` creates a new singularization rule for the
 * inflector. `rule` can be either a string or a regex.
 */
//
// export function addSingularRule(rule: RegExp, replacement: string)
export function addSingularRule(rule, replacement) {
    singulars.unshift([rule, replacement]);
}

/**
 * `irregular` is a shortcut method to create both a
 * pluralization and singularization rule for the word at
 * the same time. You must supply both the singular form
 * and the plural form as explicit strings.
 */
//
// export function addIrregularWord(singularWord: string, pluralWord: string)
export function addIrregularWord(singularWord, pluralWord) {
    addPluralRule(new RegExp('\\b' + singularWord + '\\b'), pluralWord);
    addSingularRule(new RegExp('\\b' + pluralWord + '\\b'), singularWord);
}

/**
 * `uncountable` creates a new uncountable rule for `word`.
 * Uncountable words do not get pluralized or singularized.
 */
//
// export function addUncountableWord(word: string)
export function addUncountableWord(word) {
    uncountables.unshift(word);
}

/**
 * Resets the inflector's rules to their initial state,
 * clearing out any custom rules that have been added.
 */
//
// export function resetInflections()
export function resetInflections() {
    plurals      = [];
    singulars    = [];
    uncountables = [];

    addPluralRule(/$/,                         's');
    addPluralRule(/s$/,                        's');
    addPluralRule(/^(ax|test)is$/,             '$1es');
    addPluralRule(/(octop|vir)us$/,            '$1i');
    addPluralRule(/(octop|vir)i$/,             '$1i');
    addPluralRule(/(alias|status)$/,           '$1es');
    addPluralRule(/(bu)s$/,                    '$1ses');
    addPluralRule(/(buffal|tomat)o$/,          '$1oes');
    addPluralRule(/([ti])um$/,                 '$1a');
    addPluralRule(/([ti])a$/,                  '$1a');
    addPluralRule(/sis$/,                      'ses');
    addPluralRule(/(?:([^f])fe|([lr])?f)$/,    '$1$2ves');
    addPluralRule(/(hive)$/,                   '$1s');
    addPluralRule(/([^aeiouy]|qu)y$/,          '$1ies');
    addPluralRule(/(x|ch|ss|sh)$/,             '$1es');
    addPluralRule(/(matr|vert|ind)(?:ix|ex)$/, '$1ices');
    addPluralRule(/(m|l)ouse$/,                '$1ice');
    addPluralRule(/(m|l)ice$/,                 '$1ice');
    addPluralRule(/^(ox)$/,                    '$1en');
    addPluralRule(/^(oxen)$/,                  '$1');
    addPluralRule(/(quiz)$/,                   '$1zes');

    addSingularRule(/s$/,                                                                  '');
    addSingularRule(/(ss)$/,                                                               '$1');
    addSingularRule(/(n)ews$/,                                                             '$1ews');
    addSingularRule(/([ti])a$/,                                                            '$1um');
    addSingularRule(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)(sis|ses)$/, '$1$2sis');
    addSingularRule(/(^analy)(sis|ses)$/,                                                  '$1sis');
    addSingularRule(/([^f])ves$/,                                                          '$1fe');
    addSingularRule(/(hive)s$/,                                                            '$1');
    addSingularRule(/(tive)s$/,                                                            '$1');
    addSingularRule(/([lrae])ves$/,                                                        '$1f');
    addSingularRule(/([^aeiouy]|qu)ies$/,                                                  '$1y');
    addSingularRule(/(s)eries$/,                                                           '$1eries');
    addSingularRule(/(m)ovies$/,                                                           '$1ovie');
    addSingularRule(/(x|ch|ss|sh)es$/,                                                     '$1');
    addSingularRule(/(m|l)ice$/,                                                           '$1ouse');
    addSingularRule(/(bus)(es)?$/,                                                         '$1');
    addSingularRule(/(o)es$/,                                                              '$1');
    addSingularRule(/(shoe)s$/,                                                            '$1');
    addSingularRule(/(cris|test)(is|es)$/,                                                 '$1is');
    addSingularRule(/^(a)x[ie]s$/,                                                         '$1xis');
    addSingularRule(/(octop|vir)(us|i)$/,                                                  '$1us');
    addSingularRule(/(alias|status)(es)?$/,                                                '$1');
    addSingularRule(/^(ox)en/,                                                             '$1');
    addSingularRule(/(vert|ind)ices$/,                                                     '$1ex');
    addSingularRule(/(matr)ices$/,                                                         '$1ix');
    addSingularRule(/(quiz)zes$/,                                                          '$1');
    addSingularRule(/(database)s$/,                                                        '$1');

    addIrregularWord('person', 'people');
    addIrregularWord('man',    'men');
    addIrregularWord('child',  'children');
    addIrregularWord('sex',    'sexes');
    addIrregularWord('move',   'moves');
    addIrregularWord('cow',    'kine');
    addIrregularWord('zombie', 'zombies');

    addUncountableWord('equipment');
    addUncountableWord('information');
    addUncountableWord('rice');
    addUncountableWord('money');
    addUncountableWord('species');
    addUncountableWord('series');
    addUncountableWord('fish');
    addUncountableWord('sheep');
    addUncountableWord('jeans');
    addUncountableWord('moose');
    addUncountableWord('deer');
    addUncountableWord('news');
    addUncountableWord('music');
}
resetInflections();

/**
 * Pluralizes the string passed to it. It also can accept a
 * number as the second parameter. If a number is provided,
 * it will pluralize the word to match the number. Optionally,
 * you can pass `true` as a third parameter. If found, this
 * will include the count with the output.
 */
//
// export function pluralize(word: string, count?: number, includeNumber?: boolean): string
export function pluralize(word, count, includeNumber) {
    let result;

    if (count !== undefined) {
        result = (count === 1) ? singularize(word) : pluralize(word);
        return (includeNumber) ? count + ' ' + result : result;
    }

    if (uncountables.includes(word)) {
        return word;
    }

    let rule = plurals.find((rule) => { return rule[0].test(word); });

    if (rule) {
        return word.replace(rule[0], rule[1]);
    } else {
        return word;
    }
}

/**
 * `singularize` returns the singular version of the plural
 * passed to it.
 */
// export function singularize(word: string)
export function singularize(word) {
    if (uncountables.includes(word)) {
        return word;
    }

    let rule = singulars.find((rule) => { return rule[0].test(word); });

    if (rule) {
        return word.replace(rule[0], rule[1]);
    } else {
        return word;
    }
}