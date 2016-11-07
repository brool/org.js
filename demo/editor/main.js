'use strict';

const Org = require('../../');

function load() {
  var inputEl = document.getElementById('input');
  var resultEl = document.getElementById('result');

  var orgParser = new Org.Parser();
  function renderHTML(org) {
    //  render html from org
    try {
      resultEl.innerHTML = orgParser.parse(org)
      .convert(Org.Converter.html, {
        translateSymbolArrow: true
      }).toString();
    } catch (e) {
      return alert(e);
    }
  }

  function render() {
    var org = inputEl.value;
    console.log('somo' + org);
    renderHTML(org);
  }

  function saveToLocalStorage() {
    var org = inputEl.value;
    localStorage['org'] = org;
  }

  function restoreFromLocaleStorage() {
    var org = localStorage['org'];
    if (org) {
      inputEl.value = org;
      renderHTML(org);
    }
  }

  inputEl.addEventListener('input', render, false);
  setInterval(saveToLocalStorage, 3000);
  restoreFromLocaleStorage();
}

window.addEventListener('load', load, false);
