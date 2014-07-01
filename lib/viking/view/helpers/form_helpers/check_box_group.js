// checkBoxGroup(model, attribute, options = {}, content = func(f))
// ================================================================
// 
// Usefull for rendering an checkbox group. checkBox generates an auxiliary
// hidden field before the very check box that has the same name to mimic an
// unchecked box. Using checkBox within checkBoxGroup will not generate the
// auxiliary field.
//
// A useful example of this is when you have an array of items to choose from.
//
// Examples
// --------
//   checkBoxGroup(account, 'roles', function (f) {
//       return f.checkBox('admin') + "\n" + f.checkBox('agent', { class: 'agent_check' });
//   });
//   // => <input checked id="account_roles_admin" type="checkbox" name="account[roles][]" value="admin">
//   // => <input checked class="agent_check" id="account_roles_agent" type="checkbox" name="account[roles][]" value="agent">
Viking.View.Helpers.checkBoxGroup = function (model, attribute, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }
    
    var builder = new CheckBoxGroupBuilder(model, attribute, options);
    
    return content(builder);
};