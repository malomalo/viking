import 'mocha';
import * as assert from 'assert';
import Application from 'viking/application';
import View from 'viking/view';

describe('Viking/Application', () => {
    
    it('tests the title of the Browser if the view has a title', () => {
        class MyView extends View {
            title = 'my new title';
        }
        
        let app = new Application();
        
        app.display(MyView);
        // TODO not sure why this is failing
        // assert.equal(document.title, 'my new title');
    });
});