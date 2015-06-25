//= require_self
//= require viking/view/helpers

// Viking.View
// -----------
//
// Viking.View is a framework fro handling view template lookup and rendering.
// It provides view helpers that assisst when building HTML forms and more.
Viking.View = Backbone.View.extend({

    template: undefined,

    renderTemplate: function(locals) {
        return Viking.View.Helpers.render(this.template, locals);
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
        var view = new SubView(options);
        this.subViews.push(view);
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
    }
    
    //TODO: Default render can just render template
}, {

    // `Viking.View.templates` is used for storing templates. 
    // `Viking.View.Helpers.render` looks up templates in this
    // variable
    templates: {},

    // Override the original extend function to support merging events
    extend: function(protoProps, staticProps) {
        if (protoProps && protoProps.events) {
            _.defaults(protoProps.events, this.prototype.events);
        }

        return Backbone.View.extend.call(this, protoProps, staticProps);
    }
});

Viking.View.Helpers = {};
