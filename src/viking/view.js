import Helpers from './view/helpers';
import templates from './view/templates';
import {
    tagOption, dataTagOption, tagOptions, sanitizeToId, tagNameForModelAttribute,
    addErrorClassToOptions, methodOrAttribute, urlFor
} from './view/helpers/utils';

// TODO: Remove utils from Viking.View, not sure why they are added to it.
// Viking.View
// -----------
//
// Viking.View is a framework fro handling view template lookup and rendering.
// It provides view helpers that assisst when building HTML forms and more.
export const View = Backbone.View.extend({

    template: undefined,

    renderTemplate: function(locals) {
        return Helpers.render(this.template, locals);
    },

    //Copied constructor from Backbone View
    constructor: function (options) {
        this.cid = _.uniqueId('view');
        options || (options = {});
        _.extend(this, _.pick(options, ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events']));
        this._ensureElement();
        
        // Add an array for storing subView attached to this view so we can remove then
        this.subViews = [];
        
        this.initialize.apply(this, arguments);
        this.delegateEvents();
    },
    
    // A helper method that constructs a view and adds it to the subView array
    subView: function (SubView, options) {
        let view = new SubView(options);
        this.subViews.push(view);
        this.listenTo(view, 'remove', this.removeSubView);
        return view;
    },
    
    // Removes the subview from the array and stop listening to it, and calls
    // #remove on the subview.
    removeSubView: function (view) {
        this.subViews = _.without(this.subViews, view);
        this.stopListening(view);
        view.remove();
    },
    
    // Remove all subviews when remove this view. We don't call stopListening
    // here because this view is being removed anyways so those will get cleaned
    // up by Backbone.
    remove: function () {
        while (this.subViews.length > 0){
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
    bindEl: function (attributes, selector, render) {
        let view = this;
        render || (render = function (model) { return model.get(attributes); } );
        if (!_.isArray(attributes)) { attributes = [attributes]; }
        
        //TODO: might want to Debounce because of some inputs being very rapid
        // but maybe that should be left up to the user changes (ie textareas like description)
        _.each(attributes, function (attribute) {
            view.listenTo(view.model, 'change:' + attribute, function (model) {
                view.$(selector).html( render(model) );
            });
        });
    }
    
    //TODO: Default render can just render template
}, {

    // `Viking.View.templates` is used for storing templates. 
    // `Viking.View.Helpers.render` looks up templates in this
    // variable
    templates: templates,

    // registerTemplate: function (path, template) {
    //     templates[path] = template;
    // },

    // Override the original extend function to support merging events
    extend: function(protoProps, staticProps) {
        if (protoProps && protoProps.events) {
            _.defaults(protoProps.events, this.prototype.events);
        }

        return Backbone.View.extend.call(this, protoProps, staticProps);
    },

    urlFor: urlFor,
    tagOption: tagOption,
    dataTagOption: dataTagOption,
    tagOptions: tagOptions,
    sanitizeToId: sanitizeToId,
    tagNameForModelAttribute: tagNameForModelAttribute,
    addErrorClassToOptions: addErrorClassToOptions,
    methodOrAttribute: methodOrAttribute

});

View.Helpers = Helpers;

export default View;