
<img src="/images/logo.png" width="400px">

# Installation
Viking can be installed and/or imported like any other javascript package.

```
npm install github:malomalo/viking
```

# Basic Structure
|File/Folder|Purpose|
|-----------|-------|
|application.js|Viking.Application class that provides global object|
|router.js|Viking.Router class that configures endpoints and callbacks|
|/controllers|Folder of Viking.Controllers classes to which the router directs|
|/models|Folder of Viking.Record classes that setup the schema and configuration for accessing data models|
|/views|Templates used by Viking.Controllers for rendering|

# Setup
Define a [Record](/Viking.Record.html)
```
import Record from 'viking';
class Cog extends Record {
    static schema = {
        name: {type: 'string'},
        price: {type: 'float'},
        status: {type: 'string'}
    }
}
```

Build a [View](/Viking.View.html)
```
import View from 'viking';
class CogsIndexView extends View {
    render () {
        const container = document.createElement('div')
        this.records.forEach(cog => {
            const el = document.createElement('div')
            container.append(container)
            el.innerHTML = '<span>Title:</span>' + cog.name;
        })
        
        return container
    }
}
```

Define a [Controller](/Viking.Controller.html) to declare resources and set application options
```
import Controller from 'viking';
import cogsLayout from 'layouts/cogs-layout';
clas CogsController extends Controller {
    index () {
        this.display(CogsIndexView, {
            records: Cogs.where({status: 'active'})
        }, {
            layout: cogsLayout
        })
    }
    
    show(id) {
        //...
    }
}
```

Configure routes by extending [Router](/Viking.Router.html)
```javascript
import Router from 'viking';
class MyRouter extends Router {
    static routes = {
        '/cogs': {to: [CogsController, 'index']}
        '/cogs/:id': {to: [CogsController, 'show']}
    }
}
```

Extend [Application](/Viking.Application.html)
```javascript
import Application from 'viking';
class MyApplication extends Application {
    static router = MyRouter;
}
```

Start the application on boot
```javascript
domReady(function(){
    new MyApplication().start()
})
```



