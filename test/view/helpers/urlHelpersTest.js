import 'mocha';
import * as assert from 'assert';
import {linkTo, mailTo} from 'viking/view/helpers/urlHelpers';

describe('Viking.View.Helpers.urlHelpers', () => {
    
    describe('linkTo', () => {
        it("linkTo(content, url)", () => {
            assert.equal(
                linkTo('Example', 'http://example.com'),
                '<a href="http://example.com">Example</a>'
            );
        });

        it("linkTo(contentFunc, url)", () => {
            assert.equal(
                linkTo(() => { return 'Example'; }, 'http://example.com'),
                '<a href="http://example.com">Example</a>'
            );
        });

        it("linkTo(content, url, options)", () => {
            assert.equal(
                linkTo('Example', 'http://example.com', { 'class': 'myclass' }),
                '<a class="myclass" href="http://example.com">Example</a>'
            );
        });

        it("linkTo(contentFunc, url, options)", () => {
            assert.equal(
                linkTo(() => { return 'Example'; }, 'http://example.com', { 'class': 'myclass' }),
                '<a class="myclass" href="http://example.com">Example</a>'
            );
        });

        it("linkTo(url, options, contentFunc)", () => {
            assert.equal(
                linkTo('http://example.com', { 'class': 'myclass' }, () => { return 'Example'; }),
                '<a class="myclass" href="http://example.com">Example</a>'
            );
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
            assert.equal(
                mailTo('me@domain.com'),
                '<a href="mailto:me@domain.com">me@domain.com</a>'
            );
        });
    
        it("mailTo(email, name)", () => {
            assert.equal(
                mailTo('me@domain.com', 'My email'),
                '<a href="mailto:me@domain.com">My email</a>'
            );
        });
    
        it("mailTo(email, options)", () => {
            assert.equal(
                mailTo('me@domain.com', {key: 'value'}),
                '<a href="mailto:me@domain.com" key="value">me@domain.com</a>'
            );
        });
    
        it("mailTo(email, name, options)", () => {
            assert.equal(
                mailTo('me@domain.com', 'My email', {
                    cc: 'ccaddress@domain.com',
                    subject: 'This is an example email'
                }),
                '<a href="mailto:me@domain.com?cc=ccaddress%40domain.com&subject=This%20is%20an%20example%20email">My email</a>'
            );
        });
    
        it("mailTo(email, contentFunc)", () => {
            assert.equal(
                mailTo('me@domain.com', () => {
                    return "<strong>Email me:</strong> <span>me@domain.com</span>";
                }),
                '<a href="mailto:me@domain.com"><strong>Email me:</strong> <span>me@domain.com</span></a>'
            );
        });
    
        it("mailTo(email, options, contentFunc)", () => {
            assert.equal(
                mailTo('me@domain.com', {key: 'value'}, () => {
                    return "Email me";
                }),
                '<a href="mailto:me@domain.com" key="value">Email me</a>'
            );
        });
    
        it("mailTo(email, contentFunc, options)", () => {
            assert.equal(
                mailTo('me@domain.com', () => {
                    return "Email me";
                }, {key: 'value'}),
                '<a href="mailto:me@domain.com" key="value">Email me</a>'
            );
        });

    });
});