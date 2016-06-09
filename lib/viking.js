// Viking.js <%= version %> (sha:<%= git_info[:head][:sha] %>)
// 
// (c) 2012-<%= Time.now.year %> Jonathan Bracy, 42Floors Inc.
// Viking.js may be freely distributed under the MIT license.
// http://vikingjs.com

import './viking/support';
import Model from './viking/model';

const Viking = {
    Model: Model,
};

export default Viking;
