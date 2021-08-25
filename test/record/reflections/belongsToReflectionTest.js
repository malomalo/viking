// it("belongsTo('parent')", function () {
//     let Parent = Viking.Model.extend();
//     Viking.context['Parent'] = Parent;

//     var association = new Viking.Model.BelongsToReflection('parent');

//     assert.equal(association.name, 'parent');
//     assert.equal(association.macro, 'belongsTo');
//     assert.deepEqual(association.options, {});
//     assert.propEqual(_.omit(association.modelName, 'model'), {
//         name: 'Parent',
//         element: 'parent',
//         human: 'Parent',
//         paramKey: 'parent',
//         plural: 'parents',
//         routeKey: 'parents',
//         singular: 'parent',
//         collection: 'parents',
//         collectionName: 'ParentCollection',
//         title: 'Parent'
//     });

//     delete Viking.context['Parent'];
// });

// test("::new('children', { modelName: 'Region' })", function () {
//     let Region = Viking.Model.extend();
//     Viking.context['Region'] = Region;
//     var association = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

//     assert.equal(association.name, 'parent');
//     assert.equal(association.macro, 'belongsTo');
//     assert.deepEqual(association.options, { modelName: 'Region' });
//     assert.deepEqual(association.modelName, new Viking.Model.Name('Region'));

//     delete Viking.context['Region'];
// });

// test("::new('subject', {polymorphic: true})", function () {
//     let Photo = Viking.Model.extend();
//     Viking.context['Photo'] = Photo;
//     var association = new Viking.Model.BelongsToReflection('subject', { polymorphic: true });
//     assert.equal(association.macro, 'belongsTo');
//     assert.equal(association.name, 'subject');
//     assert.deepEqual(association.options, { polymorphic: true });
//     assert.equal(association.modelName, undefined);

//     delete Viking.context['Photo'];
// });

// test("#klass", function () {
//     let Child = Viking.Model.extend();
//     let MultiWord = Viking.Model.extend();

//     Viking.context['Child'] = Child;
//     Viking.context['MultiWord'] = MultiWord;

//     var association = new Viking.Model.BelongsToReflection('child');
//     assert.equal(association.klass(), Child);

//     var association = new Viking.Model.BelongsToReflection('multi_word');
//     assert.equal(association.klass(), MultiWord);

//     delete Viking.context['Child'];
//     delete Viking.context['MultiWord'];
// });

// test("#model", function () {
//     let Child = Viking.Model.extend();

//     Viking.context['Child'] = Child;

//     var association = new Viking.Model.BelongsToReflection('child');
//     assert.equal(association.model(), Child);

//     delete Viking.context['Child'];
// });
