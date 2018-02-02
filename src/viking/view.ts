import * as Backbone from 'backbone';
import * as _ from 'underscore';

import { Helpers } from './view/helpers';

// Viking.View
// -----------
//
// Viking.View is a framework fro handling view template lookup and rendering.
// It provides view helpers that assisst when building HTML forms and more.
export const View = Backbone.View.extend({

    template: undefined,

    renderTemplate(locals) {
        return Helpers.render(this.template, locals);
    },

    // Copied constructor from Backbone View
    constructor: function (options: any = {}) {
        this.cid = _.uniqueId('view');
        _.extend(this, _.pick(options, ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events']));
        this._ensureElement();

        // Add an array for storing subView attached to this view so we can remove then
        this.subViews = [];

        this.initialize.apply(this, arguments);
        this.delegateEvents();
    },

    // A helper method that constructs a view and adds it to the subView array
    subView(SubView, options) {
        const view = new SubView(options);
        this.subViews.push(view);
        this.listenTo(view, 'remove', this.removeSubView);
        return view;
    },

    // Removes the subview from the array and stop listening to it, and calls
    // #remove on the subview.
    removeSubView(view) {
        this.subViews = _.without(this.subViews, view);
        this.stopListening(view);
        view.remove();
    },

    // Remove all subviews when remove this view. We don't call stopListening
    // here because this view is being removed anyways so those will get cleaned
    // up by Backbone.
    remove() {
        while (this.subViews.length > 0) {
            this.subViews.pop().remove();
        }

        // Emit a remove event for when a view is removed
        // TODO: Maybe backport this to Backbone?
        this.trigger('remove', this);

        Backbone.View.prototype.remove.apply(this, arguments);
    },

    // Listens to attribute(s) of the model of the view, on change
    // renders the new value to el. Optionally, pass render function to render 
    // something different, model is passed as an arg
    // TODO: document me
    bindEl(attributes: string[], selector, render?) {
        const view = this;

        if (!render) {
            render = (model) => model.get(attributes);
        }

        if (!_.isArray(attributes)) {
            attributes = [attributes];
        }

        // TODO: might want to Debounce because of some inputs being very rapid
        // but maybe that should be left up to the user changes (ie textareas like description)
        attributes.forEach((attribute) => {
            view.listenTo(view.model, 'change:' + attribute, (model) => {
                view.$(selector).html(render(model));
            });
        });

    }

    // TODO: Default render can just render template
}, {

        // `Viking.View.templates` is used for storing templates. 
        // `Viking.View.Helpers.render` looks up templates in this
        // variable
        templates: {},

        // Override the original extend function to support merging events
        extend(protoProps, staticProps) {
            if (protoProps && protoProps.events) {
                _.defaults(protoProps.events, this.prototype.events);
            }

            return Backbone.View.extend.call(this, protoProps, staticProps);
        }
    }
);

export { Helpers };
