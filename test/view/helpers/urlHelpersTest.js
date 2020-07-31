import 'mocha';
import * as assert from 'assert';
import {linkTo, mailTo} from 'viking/view/helpers/urlHelpers';

describe('Viking.View.Helpers.urlHelpers', () => {
    
    describe('linkTo', () => {
        it("linkTo(content, url)", () => {
            const t = linkTo('Example', 'http://example.com');
            assert.equal(t.innerHTML, 'Example');
            assert.tag(t, 'a', {href: 'http://example.com'});
        });

        it("linkTo(contentFunc, url)", () => {
            const t = linkTo(() => { return 'Example'; }, 'http://example.com');
            assert.equal(t.innerHTML, 'Example');
            assert.tag(t, 'a', {href: 'http://example.com'});
        });

        it("linkTo(content, url, options)", () => {
            const t = linkTo('Example', 'http://example.com', { 'class': 'myclass' });
            assert.equal(t.innerHTML, 'Example');
            assert.tag(t, 'a', {href: 'http://example.com', class: 'myclass'});
        });

        it("linkTo(contentFunc, url, options)", () => {
            const t = linkTo(() => { return 'Example'; }, 'http://example.com', { 'class': 'myclass' });
            assert.equal(t.innerHTML, 'Example');
            assert.tag(t, 'a', {href: 'http://example.com', class: 'myclass'});
        });

        it("linkTo(url, options, contentFunc)", () => {
            const t = linkTo('http://example.com', { 'class': 'myclass' }, () => { return 'Example'; });
            assert.equal(t.innerHTML, 'Example');
            assert.tag(t, 'a', {href: 'http://example.com', class: 'myclass'});
        });

        // it("linkTo(content, model)", () => {
        //     const Workshop = Viking.Model.extend('workshop');
        //     const workshopPath = (m) => '/workshops/' + m.toParam();
        //
        //     Viking.context['Workshop'] = Workshop;
        //     Viking.context['workshopPath'] = workshopPath;
        //
        //     assert.equal(
        //         Viking.View.Helpers.linkTo('Model', new Workshop({ id: 10 })),
        //         '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Model</a>'
        //     );
        //
        //     delete Viking.context['Workshop'];
        //     delete Viking.context['workshopPath'];
        // });
        //
        // it("linkTo(model, contentFunc)", () => {
        //     const Workshop = Viking.Model.extend('workshop');
        //     const workshopPath = (m) => '/workshops/' + m.toParam();
        //
        //     Viking.context['Workshop'] = Workshop;
        //     Viking.context['workshopPath'] = workshopPath;
        //
        //     assert.equal(
        //         Viking.View.Helpers.linkTo(new Workshop({ id: 10 }), function () { return 'Example'; }),
        //         '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Example</a>'
        //     );
        //
        //     delete Viking.context['Workshop'];
        //     delete Viking.context['workshopPath'];
        // });
        //
        // it("linkTo(model, options, contentFunc)", () => {
        //     const Workshop = Viking.Model.extend('workshop');
        //     const workshopPath = (m) => '/workshops/' + m.toParam();
        //
        //     Viking.context['Workshop'] = Workshop;
        //     Viking.context['workshopPath'] = workshopPath;
        //
        //     assert.equal(
        //         Viking.View.Helpers.linkTo(new Workshop({ id: 10 }), { 'class': 'myclass' }, function () { return 'Example'; }),
        //         '<a class="myclass" href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Example</a>'
        //     );
        //
        //     delete Viking.context['Workshop'];
        //     delete Viking.context['workshopPath'];
        // });
    });
    
    describe('mailTo', () => {
        it("mailTo(email)", () => {
            const t = mailTo('me@domain.com');
            assert.equal(t.innerHTML, 'me@domain.com');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com'});
        });
    
        it("mailTo(email, name)", () => {
            const t = mailTo('me@domain.com', 'My email');
            assert.equal(t.innerHTML, 'My email');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com'});
        });
    
        it("mailTo(email, options)", () => {
            const t = mailTo('me@domain.com', {key: 'value'});
            assert.equal(t.innerHTML, 'me@domain.com');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com', key: 'value'});
        });
    
        it("mailTo(email, name, options)", () => {
            const t = mailTo('me@domain.com', 'My email', {
                cc: 'ccaddress@domain.com',
                subject: 'This is an example email'
            });
            assert.equal(t.innerHTML, 'My email');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com?cc=ccaddress%40domain.com&subject=This%20is%20an%20example%20email'});
        });
    
        it("mailTo(email, contentFunc)", () => {
            const t = mailTo('me@domain.com', () => {
                return "<strong>Email me:</strong> <span>me@domain.com</span>";
            });
            assert.equal(t.innerHTML, 'strong>Email me:</strong> <span>me@domain.com</span>');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com'});
        });
    
        it("mailTo(email, options, contentFunc)", () => {
            const t = mailTo('me@domain.com', {key: 'value'}, () => {
                return "Email me";
            });
            assert.equal(t.innerHTML, 'Email me');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com', key: 'value'});
        });
    
        it("mailTo(email, contentFunc, options)", () => {
            const t = mailTo('me@domain.com', () => {
                return "Email me";
            }, {key: 'value'});
            assert.equal(t.innerHTML, 'Email me');
            assert.tag(t, 'a', {href: 'mailto:me@domain.com', key: 'value'});
        });

    });
});