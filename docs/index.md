
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

# Quickstart: Querying Records

Records are fetched from your server through a connection. Point your base
record class at an adapter once, and every model inherits it:

```js
import Record from 'viking/record';
import StandardAPIConnection from 'viking/record/adapters/standard-api-connection';

Record.connection = new StandardAPIConnection('https://api.example.com');
```

## Finding Records

```js
const cog = await Cog.find(42);        // by primary key
const first = await Cog.first();
const last = await Cog.last();
const all = await Cog.all().load();    // every record, as an array
```

## Scoping with `where`

`where` returns a [Relation](/relation.html) — a lazy, chainable scope.
Nothing hits the server until the relation is loaded:

```js
Cog.where({status: 'active'})                     // equality
Cog.where({price: {gt: 100}})                     // operators on a column
Cog.where({status: 'active'}).where({price: {gt: 100}})  // additive
```

Refine a relation with `order`, `limit`, `offset`, `distinct`, and `groupBy`:

```js
const cogs = await Cog.where({status: 'active'})
    .order({price: 'desc'})
    .limit(10)
    .load();
```

`load()` sends one request and caches the result; `reload()` fetches again.

## Iterating

Relations and collection associations implement the iterator protocols:

```js
for await (const cog of Cog.where({status: 'active'})) { ... }  // loads on demand
const cogs = await Array.fromAsync(relation);                   // detached array

// Once loaded, sync iteration works too:
[...relation]
Array.from(relation)
```

They also proxy the familiar array methods, loading on demand — `forEach`,
`map`, `filter`, `find`, `includes`, `some`, `every`, and `reduce`:

```js
const names = await Cog.where({status: 'active'}).map((c) => c.name);
const anyPricey = await relation.some((c) => c.price > 100);
```

## Aggregates

`count` and `sum` are calculated by the server — no records are loaded:

```js
const total = await Cog.count();
const value = await Cog.where({status: 'active'}).sum('price');
```

## Querying Associations

Collection associations are scopes too — chain them like relations:

```js
const factory = await Factory.find(1);

await factory.cogs;                            // load & resolve the records
await factory.cogs.where({status: 'active'}).load();  // narrowed, separate query
```

Associations chain through unloaded records — each step loads what it
needs:

```js
const activeCogs = await factory.region.factories.where({active: true}).map((f) => f.name);
```

Use `eagerLoad` to fetch associations alongside the records in one request:

```js
const cogs = await Cog.eagerLoad('factory').where({status: 'active'}).load();
cogs[0].factory;   // already loaded, no request
```

## Serializing

Records, relations, and associations all serialize cleanly:

```js
JSON.stringify(cog)              // the record's attributes
JSON.stringify(loadedRelation)   // array of record attributes (throws if unloaded)
await relation.asyncToJSON()     // loads on demand, resolves to the same output
```



