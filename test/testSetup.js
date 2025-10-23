import jsdom from 'jsdom-global';

jsdom('', {
    url: "http://example.com/",
    beforeParse(window) {
        window.scrollTo = function () {}
    }
});