import path from 'path';
import module from 'module';
import jsdom from 'jsdom-global';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

jsdom('', {
    url: "http://example.com/",
    beforeParse(window) {
        // setup dummy class for support.js
        window.DataTransferItemList = function () {}
        window.scrollTo = function () {}
    }
});

process.env.NODE_PATH = path.resolve(__dirname + '/../lib:') + process.env.NODE_PATH;
process.env.TZ = 'America/Chicago';
module._initPaths();
