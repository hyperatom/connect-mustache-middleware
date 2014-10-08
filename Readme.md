# mustache-engine

Connect middleware to compile requested html file as a mustache template before serving the response. Also allow mustache partials to be included using file system.

## Example

```js
var mustacheEngine = require('connect-mustache-middleware');

connect().use(mustacheEngine.middleware({
	rootDir: '.tmp', // path to look mustache templates
	dataDir: 'mock/data' // path to look for JSON data files
}))

```

## Installation

```npm install connect-mustache-middleware```


## Features
- Works as connect middleware and compile requested HTML file as mustache template.
- Allow mustache partials to be included using file system.
