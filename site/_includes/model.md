Model
=====

on `object.on(event, callback, [context])`
------------------------------------------


<p id="Events-on">
    <b class="header">on</b><code></code><span class="alias">Alias: bind</span>
    <br>
    Bind a <b>callback</b> function to an object. The callback will be invoked
    whenever the <b>event</b> is fired.
    If you have a large number of different events on a page, the convention is to use colons to
    namespace them: <tt>"poll:start"</tt>, or <tt>"change:selection"</tt>.
    The event string may also be a space-delimited list of several events...
</p>
    
<pre class="runnable">var object = {};

_.extend(object, Backbone.Events);

object.on("alert", function(msg) {
  alert("Triggered " + msg);
});

object.trigger("alert", "an event");
</pre>