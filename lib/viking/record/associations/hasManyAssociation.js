import CollectionAssociation from './collectionAssociation';

/**
 * Manages a one-to-many relationship for a record.
 *
 * Created via a model's `hasMany` reflection, this association holds a
 * collection of target records and provides lazy loading, mutation helpers,
 * and query delegation. It derives foreign-key constraints from the owner and
 * optionally supports polymorphic relationships via `options.as`.
 *
 * - Collection: true (multiple target records)
 * - Persistence: `addBang`/`removeBang` hit nested resource routes
 * - Loading: `load()` fetches once and caches until `reload()`
 * - Query: delegates to a scoped `Relation` (`where`, `order`, `limit`,
 *   `first`, `last`, `toArray`)
 *
 * Events dispatched mirror `Association`/`CollectionAssociation` semantics:
 * `beforeAdd`, `afterAdd`, `beforeRemove`, `afterRemove`, `beforeLoad`,
 * `afterLoad`, plus `invalid`/`error` when persisting via bang methods.
 *
 * @class HasManyAssociation
 * @memberof Association
 * @extends CollectionAssociation
 * @see Association
 * @see CollectionAssociation
 * @example
 * class Post extends Record { static hasMany('comments'); }
 * const post = Post.instantiate({ id: 1 });
 * await post.comments.load();
 * const comment = Comment.instantiate({ body: 'Nice!' });
 * await post.comments.addBang(comment);
 */

export default class HasManyAssociation extends CollectionAssociation {

    /**
     * Builds the scoped relation for this association.
     *
     * Applies the foreign key (and, if polymorphic via `options.as`, the
     * foreign type) constraint pointing back to the owner record. Any custom
     * `scope` defined on the reflection is composed on top of this base
     * constraint.
     *
     * @override
     * @returns {Relation} A relation constrained to this association
     */
    scope() {
        let klass = this.reflection.model;
        
        let relation = klass.where({
            [this.foreignKey()]: this.owner.readAttribute(this.primaryKey())
        })
        
        if (this.reflection.options.as) {
            relation = relation.where({
                [this.foreignType()]: this.owner.modelName.name
            })
        }
        
        if (this.reflection.scope) {
            relation = this.reflection.scope.call(this.owner, relation);
        }

        return relation;
    }

}
