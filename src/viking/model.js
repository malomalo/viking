import Name from './model/name';
import Type from './model/type';
import Reflection from './model/reflection';

import * as instanceProperties from './model/instance_properties';
import * as classProperties from './model/class_properties';


//= require_tree ./model/instance_properties


// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
const Model = Backbone.Model.extend(instanceProperties, classProperties);

Model.Name = Name;
Model.Type = Type;
Model.Reflection = Reflection;

export default Model;