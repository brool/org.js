import Converter from './converter'
import Node from '../node'

function HTML(orgDocument, exportOptions) {
  Converter.call(this, orgDocument, exportOptions)
  this.result = this.convert()
}

function inheritPrototype(subType, superType) {
    var prototype = Object.create(superType.prototype);

    Object.defineProperty(prototype, 'constructor', {
        enumerable: false,
        value: subType
    });

    subType.prototype = prototype;
}


inheritPrototype(HTML, Converter);

HTML.prototype.convert = function () {
  const bodyHTML = this.convertNodes(this.orgDocument.nodes, true)

  const toc = this.computeToc(this.documentOptions['toc'])
  const tocHTML = this.tocToHTML(toc)

  return {
    tocHTML,
    bodyHTML,
    toString: function () {
      return `${tocHTML}\n${bodyHTML}`
    }
  }
}

HTML.prototype.tocToHTML = function (toc) {
  function tocToHTMLFunction(tocList) {
    var html = '';
    for (const tocItem of tocList) {
      var sectionNumberText = tocItem.headerNode.sectionNumberText
      var sectionNumber = this.documentOptions.num ?
      this.inlineTag("span", sectionNumberText, {
        "class": "section-number"
      }) : "";

      var header = this.getNodeTextContent(tocItem.headerNode);
      var headerLink = this.inlineTag("a", sectionNumber + header, {
        href: "#header-" + sectionNumberText.replace(/\./g, "-")
      });
      var subList = tocItem.childTocs.length ? tocToHTMLFunction.call(this, tocItem.childTocs) : ''
      html += this.tag("li", headerLink + subList);
    }
    return this.tag("ul", html)
  }

  return tocToHTMLFunction.call(this, toc)
}

HTML.prototype.computeAuxDataForNode = function (node) {
  while (node.parent && node.parent.type === Node.types.inlineContainer) {
    node = node.parent;
  }
  var attributesNode = node.previousSibling;
  var attributesText = "";
  while (attributesNode && attributesNode.type === Node.types.directive && attributesNode.directiveName === "attr_html:") {
    attributesText += attributesNode.directiveRawValue + " ";
    attributesNode = attributesNode.previousSibling;
  }
  return attributesText
}

// Method to construct org-js generated class
HTML.prototype.orgClassName = function (className) {
  return this.exportOptions.htmlClassPrefix ?
  this.exportOptions.htmlClassPrefix + className
  : className;
}

// Method to construct org-js generated id
HTML.prototype.orgId = function (id) {
  return this.exportOptions.htmlIdPrefix ?
  this.exportOptions.htmlIdPrefix + id
  : id;
}

// ----------------------------------------------------
// Node conversion
// ----------------------------------------------------

HTML.prototype.convertHeader = function (node, childText, auxData, taskStatus, sectionNumberText) {
  var headerAttributes = {};

  if (taskStatus) {
    childText = this.inlineTag("span", childText.substring(0, 4), {
      "class": "task-status " + taskStatus
    }) + childText.substring(5);
  }

  if (sectionNumberText) {
    childText = this.inlineTag("span", sectionNumberText, {
      "class": "section-number"
    }) + childText;
    headerAttributes["id"] = "header-" + sectionNumberText.replace(/\./g, "-");
  }

  if (taskStatus)
  headerAttributes["class"] = "task-status " + taskStatus;

  return this.tag(`h${node.level}`, childText, headerAttributes, auxData);
}

HTML.prototype.convertOrderedList = function (node, childText, auxData) {
  return this.tag("ol", childText, null, auxData);
}

HTML.prototype.convertUnorderedList = function (node, childText, auxData) {
  return this.tag("ul", childText, null, auxData);
}

HTML.prototype.convertDefinitionList = function (node, childText, auxData) {
  return this.tag("dl", childText, null, auxData);
}

HTML.prototype.convertDefinitionItem = function (node, childText, auxData, term, definition) {
  return this.tag("dt", term) + this.tag("dd", definition);
}

HTML.prototype.convertListItem = function (node, childText, auxData) {
  if (this.exportOptions.suppressCheckboxHandling) {
    return this.tag("li", childText, null, auxData);
  } else {
    var listItemAttributes = {};
    var listItemText = childText;
    // Embed checkbox
    if (/^\s*\[(X| |-)\]([\s\S]*)/.exec(listItemText)) {
      listItemText = RegExp.$2 ;
      var checkboxIndicator = RegExp.$1;

      var checkboxAttributes = { type: "checkbox" };
      switch (checkboxIndicator) {
        case "X":
        checkboxAttributes["checked"] = "true";
        listItemAttributes["data-checkbox-status"] = "done";
        break;
        case "-":
        listItemAttributes["data-checkbox-status"] = "intermediate";
        break;
        default:
        listItemAttributes["data-checkbox-status"] = "undone";
        break;
      }

      listItemText = this.inlineTag("input", null, checkboxAttributes) + listItemText;
    }

    return this.tag("li", listItemText, listItemAttributes, auxData);
  }
}

HTML.prototype.convertParagraph = function (node, childText, auxData) {
  return this.tag("p", childText, null, auxData);
}

HTML.prototype.convertPreformatted = function (node, childText, auxData) {
  return this.tag("pre", childText, null, auxData);
}

HTML.prototype.convertTable = function (node, childText, auxData) {
  return this.tag("table", this.tag("tbody", childText), null, auxData);
}

HTML.prototype.convertTableRow = function (node, childText, auxData) {
  return this.tag("tr", childText);
}

HTML.prototype.convertTableHeader = function (node, childText, auxData) {
  return this.tag("th", childText);
}

HTML.prototype.convertTableCell = function (node, childText, auxData) {
  return this.tag("td", childText);
}

HTML.prototype.convertHorizontalRule = function (node, childText, auxData) {
  return this.tag("hr", null, null, auxData);
}

HTML.prototype.convertInlineContainer = function (node, childText, auxData) {
  return childText
}

HTML.prototype.convertBold = function (node, childText, auxData) {
  return this.inlineTag("b", childText);
}

HTML.prototype.convertItalic = function (node, childText, auxData) {
  return this.inlineTag("i", childText);
}

HTML.prototype.convertUnderline = function (node, childText, auxData) {
  return this.inlineTag("span", childText, {
    style: "text-decoration:underline;"
  });
}

HTML.prototype.convertCode = function (node, childText, auxData) {
  return this.inlineTag("code", childText);
}

HTML.prototype.convertDashed = function (node, childText, auxData) {
  return this.inlineTag("del", childText);
}

HTML.prototype.convertLink = function (node, childText, auxData) {
  var srcParameterStripped = this.stripParametersFromURL(node.src);
  if (this.imageExtensionPattern.exec(srcParameterStripped)) {
    var imgText = this.getNodeTextContent(node);
    return this.inlineTag("img", null, {
      src: node.src,
      alt: imgText,
      title: imgText
    }, auxData);
  } else {
    return this.inlineTag("a", childText, { href: node.src });
  }
}

HTML.prototype.convertQuote = function (node, childText, auxData) {
  return this.tag("blockquote", childText, null, auxData);
}

HTML.prototype.convertExample = function (node, childText, auxData) {
  return this.tag("pre", childText, null, auxData);
}

HTML.prototype.convertSrc = function (node, childText, auxData) {
  var codeLanguage = node.directiveArguments.length
  ? node.directiveArguments[0]
  : "unknown";
  childText = this.tag("code", childText, {
    "class": "language-" + codeLanguage
  }, auxData);

  return this.tag("pre", childText);
}

// @override
HTML.prototype.convertHTML = function (node, childText, auxData) {
  if (node.directiveName === "html:") {
    return node.directiveRawValue;
  } else if (node.directiveName === "html") {
    return node.children.map(function (textNode) {
      return textNode.value;
    }).join("\n");
  } else {
    return childText;
  }
}

// @implement
HTML.prototype.convertHeaderBlock = function (headerBlock, level, index) {
  level = level || 0;
  index = index || 0;

  var contents = [];

  var headerNode = headerBlock.header;
  if (headerNode) {
    contents.push(this.convertNode(headerNode));
  }

  var blockContent = this.convertNodes(headerBlock.childNodes);
  contents.push(blockContent);

  var childBlockContent = headerBlock.childBlocks
  .map(function (block, idx) {
    return this.convertHeaderBlock(block, level + 1, idx);
  }, this)
  .join("\n");
  contents.push(childBlockContent);

  var contentsText = contents.join("\n");

  if (headerNode) {
    return this.tag("section", "\n" + contents.join("\n"), {
      "class": "block block-level-" + level
    });
  } else {
    return contentsText;
  }
}

// ----------------------------------------------------
// Supplemental methods
// ----------------------------------------------------

HTML.prototype.replaceMap = {
  // [replacing pattern, predicate]
  "&": ["&#38;", null],
  "<": ["&#60;", null],
  ">": ["&#62;", null],
  '"': ["&#34;", null],
  "'": ["&#39;", null],
  "->": ["&#10132;", function (text, insideCodeElement) {
    return this.exportOptions.translateSymbolArrow && !insideCodeElement;
  }]
}

HTML.prototype.replaceRegexp = null

// @implement @override
HTML.prototype.escapeSpecialChars = function (text, insideCodeElement) {
  if (!this.replaceRegexp) {
    this.replaceRegexp = new RegExp(Object.keys(this.replaceMap).join("|"), "g");
  }

  var replaceMap = this.replaceMap;
  var self = this;
  return text.replace(this.replaceRegexp, function (matched) {
    if (!replaceMap[matched]) {
      throw Error("escapeSpecialChars: Invalid match");
    }

    var predicate = replaceMap[matched][1];
    if (typeof predicate === "function" &&
    !predicate.call(self, text, insideCodeElement)) {
      // Not fullfill the predicate
      return matched;
    }

    return replaceMap[matched][0];
  });
}

// @implement
HTML.prototype.postProcess = function (node, currentText, insideCodeElement) {
  if (this.exportOptions.exportFromLineNumber && typeof node.fromLineNumber === "number") {
    // Wrap with line number information
    currentText = this.inlineTag("div", currentText, {
      "data-line-number": node.fromLineNumber
    });
  }
  return currentText;
}

// @implement
HTML.prototype.makeLink = function (url) {
  return "<a href=\"" + url + "\">" + decodeURIComponent(url) + "</a>";
}

// @implement
HTML.prototype.makeSubscript = function (match, body, subscript) {
  return "<span class=\"org-subscript-parent\">" +
  body +
  "</span><span class=\"org-subscript-child\">" +
  subscript +
  "</span>";
}

// ----------------------------------------------------
// Specific methods
// ----------------------------------------------------

HTML.prototype.attributesObjectToString = function (attributesObject) {
  var attributesString = "";
  for (var attributeName in attributesObject) {
    if (attributesObject.hasOwnProperty(attributeName)) {
      var attributeValue = attributesObject[attributeName];
      // To avoid id/class name conflicts with other frameworks,
      // users can add arbitrary prefix to org-js generated
      // ids/classes via exportOptions.
      if (attributeName === "class") {
        attributeValue = this.orgClassName(attributeValue);
      } else if (attributeName === "id") {
        attributeValue = this.orgId(attributeValue);
      }
      attributesString += " " + attributeName + "=\"" + attributeValue + "\"";
    }
  }
  return attributesString;
}

HTML.prototype.inlineTag = function (name, innerText, attributesObject, auxAttributesText) {
  attributesObject = attributesObject || {};

  var htmlString = "<" + name;
  // TODO: check duplicated attributes
  if (auxAttributesText)
  htmlString += " " + auxAttributesText;
  htmlString += this.attributesObjectToString(attributesObject);

  if (innerText === null)
  return htmlString + "/>";

  htmlString += ">" + innerText + "</" + name + ">";

  return htmlString;
}

HTML.prototype.tag = function (name, innerText, attributesObject, auxAttributesText) {
  return this.inlineTag(name, innerText, attributesObject, auxAttributesText) + "\n";
}

export default HTML;
