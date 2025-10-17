import 'mocha';
import assert from 'assert';
import * as Inflector from 'viking/support/inflector';

let regularExamples = [
    ['rose', 'roses'],
    ['tomato', 'tomatoes'],
    ['datum', 'data'],
    ['boss', 'bosses'],
    ['soliloquy', 'soliloquies'],
    ['wish', 'wishes'],
    ['parenthesis', 'parentheses'],
    ['thesis', 'theses'],
    ['analysis', 'analyses'],
    ['life', 'lives'],
    ['hive', 'hives'],
    ['tive', 'tives'],
    ['leaf', 'leaves'],
    ['loaf', 'loaves'],
    ['elf', 'elves'],
    ['thief', 'thieves'],
    ['series', 'series'],
    ['movie', 'movies'],
    ['x', 'xes'],
    ['mouse', 'mice'],
    ['louse', 'lice'],
    ['bus', 'buses'],
    ['shoe', 'shoes'],
    ['crisis', 'crises'],
    ['axis', 'axes'],
    ['octopus', 'octopi'],
    ['virus', 'viri'],
    ['status', 'statuses'],
    ['alias', 'aliases'],
    ['ox', 'oxen'],
    ['vertex', 'vertices'],
    ['index', 'indices'],
    ['matrix', 'matrices'],
    ['quiz', 'quizzes'],
    ['database', 'databases']
];

let irregularExamples = [
    ['person', 'people'],
    ['man', 'men'],
    ['child', 'children'],
    ['sex', 'sexes'],
    ['move', 'moves'],
    ['cow', 'kine'],
    ['zombie', 'zombies']
];

let uncountableExamples = [
    'equipment',
    'information',
    'rice',
    'money',
    'species',
    'series',
    'fish',
    'sheep',
    'jeans',
    'moose',
    'deer',
    'news',
    'music'
];

describe('VikingSupport.Inflector', () => {

    it('plurals from singular', () => {
        regularExamples.forEach((word) => {
            assert.equal(Inflector.pluralize(word[0]), word[1]);
        });
    });

    it('plurals from plural', () => {
        regularExamples.forEach((word) => {
            assert.equal(Inflector.pluralize(word[1]), word[1]);
        });
    });

    it('singulars from plural', () => {
        regularExamples.forEach((word) => {
            assert.equal(Inflector.singularize(word[1]), word[0]);
        });
    });

    it('singulars from single', () => {
        regularExamples.forEach((word) => {
            assert.equal(Inflector.singularize(word[0]), word[0]);
        });
    });

    it('irregulars', () => {
        irregularExamples.forEach((word) => {
            assert.equal(Inflector.pluralize(word[0]), word[1]);
            assert.equal(Inflector.singularize(word[1]), word[0]);
        });
    });

    it('uncountables', () => {
        uncountableExamples.forEach((word) => {
            assert.equal(Inflector.pluralize(word), word);
            assert.equal(Inflector.singularize(word), word);
        });
    });

    it('resets the default inflections', () => {
        Inflector.addIrregularWord('haxor', 'hax0rs!');
        assert.equal('hax0rs!', Inflector.pluralize('haxor'));
        Inflector.resetInflections();
        assert.equal('haxors', Inflector.pluralize('haxor'));
    });

    describe('#addIrregularWord', () => {
        afterEach((done) => {
            Inflector.resetInflections();
            done();
        });

        it('adds a rule to pluralize the special case', () => {
            Inflector.addIrregularWord('haxor', 'hax0rs!');
            assert.equal('hax0rs!', Inflector.pluralize('haxor'));
        });

        it('adds a rule to singularize the special case', function() {
            Inflector.addIrregularWord('hax0r!', 'haxors');
            assert.equal('hax0r!', Inflector.singularize('haxors'));
        });
    });

    describe('#addPluralRule', () => {
        afterEach((done) => {
            Inflector.resetInflections();
            done();
        });

        it('adds a new pluralization rule', () => {
            Inflector.addPluralRule(/(ax)is$/i, '$1es');
            assert.equal('axes', Inflector.pluralize('axis'));
        });
    });

    describe('#pluralize', () => {

        it('pluralizes the given noun', () => {
            assert.equal('posts', Inflector.pluralize('post'));
        });

        it('returns the same word if it cannot be pluralized', () => {
            assert.equal('posts', Inflector.pluralize('posts'));
        });

        it('pluralizes the word if count not 1', () => {
            assert.equal('posts', Inflector.pluralize('post', 0));
            assert.equal('posts', Inflector.pluralize('post', 2));
        });

        it('pluralizes the word if count non-1 float', () => {
            assert.equal('posts', Inflector.pluralize('post', 1.5));
        });

        it('singularizes the word if count 1', () => {
            assert.equal('post', Inflector.pluralize('post', 1));
        });

        it('includes the word with the plural', () => {
            assert.equal('0 posts', Inflector.pluralize('post', 0, true));
            assert.equal('2 posts', Inflector.pluralize('post', 2, true));
        });

        it('includes the word with non-1 float', () => {
            assert.equal('1.3 posts', Inflector.pluralize('post', 1.3, true));
        });

        it('includes the word with the singular', () => {
            assert.equal('1 post', Inflector.pluralize('post', 1, true));
        });
    });

    describe('#addSingularRule', () => {
        afterEach((done) => {
            Inflector.resetInflections();
            done();
        });

        it('adds a new singularization rule by regex', function() {
            Inflector.addSingularRule(/(plat)au$/i, '$1um');
            assert.equal(Inflector.singularize('platau'), 'platum');
        });
    });

    describe('#singularize', () => {
        it('singularizes the given noun', () => {
            assert.equal(Inflector.singularize('posts'), 'post');
        });

        it('returns the same word if it cannot be singularized', () => {
            assert.equal(Inflector.singularize('post'), 'post');
        });

        it('singularizes a word that contains an irregular', () => {
            assert.equal(Inflector.singularize('comments'), 'comment');
        });
    });

    describe('#uncountable', function() {
        afterEach((done) => {
            Inflector.resetInflections();
            done();
        });

        it('notes the word as a special case in pluralization', function() {
            Inflector.addUncountableWord('asdf');
            assert.equal(Inflector.pluralize('asdf'), 'asdf');
        });

        it('notes the word as a special case in singularization', function() {
          Inflector.addUncountableWord('asdf');
          assert.equal(Inflector.singularize('asdf'), 'asdf');
        });
    });

    // describe('Ordinalize', () => {
    //     it('returns a stirng that is not a number or string', function() {
    //       expect(_.ordinalize('hello')).to.equal('hello');
    //     });

    //     it('ordinalizes a number', function() {
    //       expect(_.ordinalize(4)).to.equal('4th');
    //     });

    //     it('ordinalizes a number string', function() {
    //       expect(_.ordinalize('4')).to.equal('4th');
    //     });

    //     it('ordinalizes 0 to "0th"', function() {
    //       expect(_.ordinalize(0)).to.equal('0th');
    //     });

    //     it('ordinalizes 1 to "1st"', function() {
    //       expect(_.ordinalize(1)).to.equal('1st');
    //     });

    //     it('ordinalizes 2 to "2nd', function() {
    //       expect(_.ordinalize(2)).to.equal('2nd');
    //     });

    //     it('ordinalizes 3 to "3rd"', function() {
    //       expect(_.ordinalize(3)).to.equal('3rd');
    //     });

    //     it('ordinalizes 11 to "11th"', function() {
    //       expect(_.ordinalize(11)).to.equal('11th');
    //     });

    //     it('ordinalizes 12 to "12th"', function() {
    //       expect(_.ordinalize(12)).to.equal('12th');
    //     });

    //     it('ordinalizes 13 to "13th"', function() {
    //       expect(_.ordinalize(13)).to.equal('13th');
    //     });

    //     it('ordinalizes 1003 to "1003rd"', function() {
    //       expect(_.ordinalize(1003)).to.equal('1003rd');
    //     });

    //     it('ordinalizes -11 to "-11th', function() {
    //       expect(_.ordinalize(-11)).to.equal('-11th');
    //     });

    //     it('ordinalizes -1021 to "-1021st', function() {
    //       expect(_.ordinalize(-1021)).to.equal('-1021st');
    //     });
    // });
});