# org.js

Parser and converter for [org-mode](http://orgmode.org/) notation written in JavaScript.

## Interactive Editor
For working example, see `demo/editor`.

## Installation

```
npm install -S org.js
```

## Usage
### org -> HTML

```javascript
const org = require("org");
const parser = new org.Parser();

const orgCode = '* A Big Title';
const orgDoc = parser.parse(orgCode);
const orgHTMLDoc = orgDoc.convert(org.Converter.html, {
  exportFromLineNumber: false,
  suppressSubScriptHandling: false,
  suppressAutoLink: false
});

console.dir(orgHTMLDoc);  // { title, contentHTML, tocHTML, toc }
console.log(orgHTMLDoc.toString())  // Rendered HTML
```

## Expand
### Writing a converter
Read `src/converter/html.js`.

## Announcement
* Original code is from [mooz/org-js](https://github.com/mooz/org-js).

## License
MIT
