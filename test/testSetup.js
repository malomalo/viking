import path from 'path';
import module from 'module';
import jsdom from 'jsdom-global';

jsdom('', {
    url: "http://example.com/"
});

process.env.NODE_PATH = path.resolve(__dirname + '/../lib:') + process.env.NODE_PATH;
module._initPaths();