import path from 'path';
import module from 'module';
import jsdom from 'jsdom-global';

jsdom('', {
    url: "http://example.com/",
    beforeParse(window) {
        // setup dummy class for support.js
        window.DataTransferItemList = function () {}
    }
});

process.env.NODE_PATH = path.resolve(__dirname + '/../lib:') + process.env.NODE_PATH;
module._initPaths();
