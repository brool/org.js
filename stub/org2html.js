#!/usr/bin/env node

const fs = require('fs');
const org = require('./');

const orgCode = fs.readFileSync('./stub/test.org', {
  encoding: 'utf8'
});

function parseAndOutputHTML(orgCode) {
  const parser = new org.Parser();
  const orgDoc = parser.parse(orgCode);
  console.log(orgDoc);
  var orgHTMLDoc = orgDoc.convert(org.Converter.html, {});
  return orgHTMLDoc.toString();
}


console.log(parseAndOutputHTML(orgCode));
