org-js
======

Parser and converter for org-mode (<http://orgmode.org/>) notation written in JavaScript.

Interactive Editor
------------------

For working example, see http://mooz.github.com/org-js/editor/.

Installation
------------

    (WIP)

Simple example of org -> HTML conversion
----------------------------------------

```javascript
const org = require("org");

const orgCode = '* A Big Title';

const parser = new org.Parser();
const orgDoc = parser.parse(orgCode);
const orgHTMLDoc = orgDoc.convert(org.Converter.html, {
  headerOffset: 1,
  exportFromLineNumber: false,
  suppressSubScriptHandling: false,
  suppressAutoLink: false
});

console.dir(orgHTMLDoc); // => { title, contentHTML, tocHTML, toc }
console.log(orgHTMLDoc.toString()) // => Rendered HTML
```

Writing yet another converter
-----------------------------

See `lib/org/converter/html.js`.
