var x;
// Creates a form that allows the user to create or update the attributes
// of a specific model.
//
// The method can be used in several slightly different ways, depending on
// how much you wish to rely on Viking to infer automatically from the model
// how the form should be constructed. For a generic model object, a form
// can be created by passing +formFor+ a string representing the object we are
// concerned with:
//
//   <%= formFor('person', function(f) { %>
//     First name: <%= f.textField('first_name') %><br />
//     Last name : <%= f.textField('last_name') %><br />
//     Biography : <%= f.textArea('biography') %><br />
//     Admin?    : <%= f.checkBox('admin') %><br />
//     <%= f.submit() %>
//   <% }) %>
//
// The variable +f+ yielded to the block is a FormBuilder object that
// incorporates the knowledge about the model object represented by
// <tt>"person"</tt> passed to +form_for+. Methods defined on the FormBuilder
// are used to generate fields bound to this model. Thus, for example,
//
//   <%= f.textField("first_name") %>
//
// will get expanded to
//
//   <%= textField("person", "first_name") %>
//
// which results in an html <tt><input></tt> tag whose +name+ attribute is
// <tt>person[first_name]</tt>. This means that when the form is submitted,
// the value entered by the user will be available in a Rails controller as
// <tt>params[:person][:first_name]</tt>.
//
// For fields generated in this way using the FormBuilder, if <tt>person</tt>
// is a model record, the default value of the field shown when the form is
// initially displayed (e.g. in the situation where you are editing an
// existing record) will be the value of the corresponding attribute of
// the <tt>person</tt> model.
//
// The options argument to +formFor+ is an optional hash of options -
//
// * <tt>:url</tt> - The URL the form is to be submitted to. This may be
//   represented in the same way as values passed to +url_for+ or +link_to+.
//   So for example you may use a named route directly. When the model is
//   represented by a string or symbol, as in the example above, if the
//   <tt>:url</tt> option is not specified, by default the form will be
//   sent back to the current url (We will describe below an alternative
//   resource-oriented usage of +form_for+ in which the URL does not need
//   to be specified explicitly).
// * <tt>:namespace</tt> - A namespace for your form to ensure uniqueness of
//   id attributes on form elements. The namespace attribute will be prefixed
//   with underscore on the generated HTML id.
// * <tt>:html</tt> - Optional HTML attributes for the form tag.
//
// Also note that +form_for+ doesn't create an exclusive scope. It's still
// possible to use both the stand-alone FormHelper methods and methods
// from FormTagHelper. For example:
//
//   <%= formFor('person', function (f) { %>
//     First name: <%= f.textField('first_name') %>
//     Last name : <%= f.textField('last_name') %>
//     Biography : <%= textArea('person', 'biography') %>
//     Admin?    : <%= checkBoxTag("person[admin]", "1", person.company.admin?) %>
//     <%= f.submit() %>
//   <% }) %>
//
// This also works for the methods in FormOptionHelper and DateHelper that
// are designed to work with an object as base, like
// FormOptionHelper#collectionSelect and DateHelper#datetimeSelect.
//
// === #form_for with a model object
//
// In the examples above, the object to be created or edited was
// represented by a symbol passed to +form_for+, and we noted that
// a string can also be used equivalently. It is also possible, however,
// to pass a model object itself to +form_for+. For example, if <tt>@post</tt>
// is an existing record you wish to edit, you can create the form using
//
//   <%= form_for @post do |f| %>
//     ...
//   <% end %>
//
// This behaves in almost the same way as outlined previously, with a
// couple of small exceptions. First, the prefix used to name the input
// elements within the form (hence the key that denotes them in the +params+
// hash) is actually derived from the object's _class_, e.g. <tt>params[:post]</tt>
// if the object's class is +Post+. However, this can be overwritten using
// the <tt>:as</tt> option, e.g. -
//
//   <%= form_for(@person, as: :client) do |f| %>
//     ...
//   <% end %>
//
// would result in <tt>params[:client]</tt>.
//
// Secondly, the field values shown when the form is initially displayed
// are taken from the attributes of the object passed to +form_for+,
// regardless of whether the object is an instance
// variable. So, for example, if we had a _local_ variable +post+
// representing an existing record,
//
//   <%= form_for post do |f| %>
//     ...
//   <% end %>
//
// would produce a form with fields whose initial state reflect the current
// values of the attributes of +post+.
//
// === Resource-oriented style
//
// In the examples just shown, although not indicated explicitly, we still
// need to use the <tt>:url</tt> option in order to specify where the
// form is going to be sent. However, further simplification is possible
// if the record passed to +form_for+ is a _resource_, i.e. it corresponds
// to a set of RESTful routes, e.g. defined using the +resources+ method
// in <tt>config/routes.rb</tt>. In this case Rails will simply infer the
// appropriate URL from the record itself. For example,
//
//   <%= form_for @post do |f| %>
//     ...
//   <% end %>
//
// is then equivalent to something like:
//
//   <%= form_for @post, as: :post, url: post_path(@post), method: :patch, html: { class: "edit_post", id: "edit_post_45" } do |f| %>
//     ...
//   <% end %>
//
// And for a new record
//
//   <%= form_for(Post.new) do |f| %>
//     ...
//   <% end %>
//
// is equivalent to something like:
//
//   <%= form_for @post, as: :post, url: posts_path, html: { class: "new_post", id: "new_post" } do |f| %>
//     ...
//   <% end %>
//
// However you can still overwrite individual conventions, such as:
//
//   <%= form_for(@post, url: super_posts_path) do |f| %>
//     ...
//   <% end %>
//
// You can also set the answer format, like this:
//
//   <%= form_for(@post, format: :json) do |f| %>
//     ...
//   <% end %>
//
// For namespaced routes, like +admin_post_url+:
//
//   <%= form_for([:admin, @post]) do |f| %>
//    ...
//   <% end %>
//
// If your resource has associations defined, for example, you want to add comments
// to the document given that the routes are set correctly:
//
//   <%= form_for([@document, @comment]) do |f| %>
//    ...
//   <% end %>
//
// Where <tt>@document = Document.find(params[:id])</tt> and
// <tt>@comment = Comment.new</tt>.
//
// === Setting the method
//
// You can force the form to use the full array of HTTP verbs by setting
//
//    method: (:get|:post|:patch|:put|:delete)
//
// in the options hash. If the verb is not GET or POST, which are natively
// supported by HTML forms, the form will be set to POST and a hidden input
// called _method will carry the intended verb for the server to interpret.
//
// === Unobtrusive JavaScript
//
// Specifying:
//
//    remote: true
//
// in the options hash creates a form that will allow the unobtrusive JavaScript drivers to modify its
// behavior. The expected default behavior is an XMLHttpRequest in the background instead of the regular
// POST arrangement, but ultimately the behavior is the choice of the JavaScript driver implementor.
// Even though it's using JavaScript to serialize the form elements, the form submission will work just like
// a regular submission as viewed by the receiving side (all elements available in <tt>params</tt>).
//
// Example:
//
//   <%= form_for(@post, remote: true) do |f| %>
//     ...
//   <% end %>
//
// The HTML generated for this would be:
//
//   <form action='http://www.example.com' method='post' data-remote='true'>
//     <div style='margin:0;padding:0;display:inline'>
//       <input name='_method' type='hidden' value='patch' />
//     </div>
//     ...
//   </form>
//
// === Setting HTML options
//
// You can set data attributes directly by passing in a data hash, but all other HTML options must be wrapped in
// the HTML key. Example:
//
//   <%= form_for(@post, data: { behavior: "autosave" }, html: { name: "go" }) do |f| %>
//     ...
//   <% end %>
//
// The HTML generated for this would be:
//
//   <form action='http://www.example.com' method='post' data-behavior='autosave' name='go'>
//     <div style='margin:0;padding:0;display:inline'>
//       <input name='_method' type='hidden' value='patch' />
//     </div>
//     ...
//   </form>
//
// === Removing hidden model id's
//
// The form_for method automatically includes the model id as a hidden field in the form.
// This is used to maintain the correlation between the form data and its associated model.
// Some ORM systems do not use IDs on nested models so in this case you want to be able
// to disable the hidden id.
//
// In the following example the Post model has many Comments stored within it in a NoSQL database,
// thus there is no primary key for comments.
//
// Example:
//
//   <%= form_for(@post) do |f| %>
//     <%= f.fields_for(:comments, include_id: false) do |cf| %>
//       ...
//     <% end %>
//   <% end %>
//
// === Customized form builders
//
// You can also build forms using a customized FormBuilder class. Subclass
// FormBuilder and override or define some more helpers, then use your
// custom builder. For example, let's say you made a helper to
// automatically add labels to form inputs.
//
//   <%= form_for @person, url: { action: "create" }, builder: LabellingFormBuilder do |f| %>
//     <%= f.text_field :first_name %>
//     <%= f.text_field :last_name %>
//     <%= f.text_area :biography %>
//     <%= f.check_box :admin %>
//     <%= f.submit %>
//   <% end %>
//
// In this case, if you use this:
//
//   <%= render f %>
//
// The rendered template is <tt>people/_labelling_form</tt> and the local
// variable referencing the form builder is called
// <tt>labelling_form</tt>.
//
// The custom FormBuilder class is automatically merged with the options
// of a nested fields_for call, unless it's explicitly set.
//
// In many cases you will want to wrap the above in another helper, so you
// could do something like the following:
//
//   def labelled_form_for(record_or_name_or_array, *args, &block)
//     options = args.extract_options!
//     form_for(record_or_name_or_array, *(args << options.merge(builder: LabellingFormBuilder)), &block)
//   end
//
// If you don't need to attach a form to a model instance, then check out
// FormTagHelper#form_tag.
//
// === Form to external resources
//
// When you build forms to external resources sometimes you need to set an authenticity token or just render a form
// without it, for example when you submit data to a payment gateway number and types of fields could be limited.
//
// To set an authenticity token you need to pass an <tt>:authenticity_token</tt> parameter
//
//   <%= form_for @invoice, url: external_url, authenticity_token: 'external_token' do |f|
//     ...
//   <% end %>
//
// If you don't want to an authenticity token field be rendered at all just pass <tt>false</tt>:
//
//   <%= form_for @invoice, url: external_url, authenticity_token: false do |f|
//     ...
//   <% end %>
Viking.View.capture = function(content) {
    return content;
};

Viking.View.Helpers.formFor = function(model, options, content) {
    return Viking.View.capture(content);
}