#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const org = require('../dist/org.cjs.js');

const orgCode = fs.readFileSync(path.join(__dirname, 'test.org'), {
  encoding: 'utf8'
});

function parseAndOutputHTML(orgCode) {
  const parser = new org.Parser();
  const orgDoc = parser.parse(orgCode);
  var orgHTMLDoc = orgDoc.convert(org.Converter.html, {});
  return orgHTMLDoc;
}
console.log(parseAndOutputHTML(orgCode));
