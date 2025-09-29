
<img src="/images/logo.png" width="400px">

Viking.js is an open-source web framework for JavaScript web applications.

Inspired by Ruby on Rails and Backbone.js it makes it easier to write client side JavaScript applications. 

# Installation

```shell
npm install github:malomalo/viking
```

# Basic Structure

| File/Folder           | Purpose                                                   |
|-----------------------|-----------------------------------------------------------|
| /boot.js              | Boot file to initialize and start the Application         |
| /application.js       | Application class that provides global object             |
| /config/router.js     | Router class that maps urls to Controllers or callbacks   |
| /config/initializers/ | Folder for initializers to be called from the Application | 
| /controllers/         | Folder for controllers                                    |
| /models/              | Folder for Record classes                                 |
| /views/               | View and Templates for controllers to render              |

# Setup
Define a [Record](/record.html)

```js
// /models/cog.js
import Record from 'viking';

class Cog extends Record {
    static schema = {
        name: {type: 'string'},
        price: {type: 'float'},
        status: {type: 'string'}
    }
}
```

Build a [View](/view.html)
```js
import View from 'viking';

class CogsIndexView extends View {
  
    render () {
        const container = document.createElement('div');
        
        await this.records.forEach(cog => {
            const el = document.createElement('div')
            el.innerHTML = '<span>Title:</span>' + cog.name;
            container.append(el)
        })
        
        return container
    }
    
}
```

Define a [Controller](/controller.html) to declare resources and set application
options
```js
import Controller from 'viking';
import CogsIndexView from 'views/cogs/index';

clas CogsController extends Controller {
    index () {
        this.display(CogsIndexView.new({
            records: Cogs.where({status: 'active'})
        }).el, {}, {
            layout: cogsLayout
        })
    }
    
    show(id) {
        //...
    }
}
```

Configure routes by extending [Router](/router.html)
```js
import Router from 'viking';
class MyRouter extends Router {
    static routes = {
        '/cogs': {to: [CogsController, 'index']}
        '/cogs/:id': {to: [CogsController, 'show']}
    }
}
```

Create the [Application](/application.html)
```js
import Application from 'viking';

class MyApplication extends Application {
    static router = MyRouter;
}
```

Start the application on boot
```js
import domReady from 'viking/support';

domReady(function(){
    new MyApplication().start()
})
```



