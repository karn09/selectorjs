'use strict'

function selectorTypeMatcher(selector) {
  var firstChar = selector.slice(0, 1);
  if (firstChar === '#')
    return 'id';
  if (firstChar === '.')
    return 'class';
  if (selector.indexOf('.') !== -1)
    return 'tag.class';
  return 'tag';
}

function matchFunctionMaker(selector) {
  function matchClass(elem, _class) {
    return elem.className.split(' ').indexOf(_class) !== -1;
  }

  function matchTag(elem, tag) {
    return elem.tagName && tag && elem.tagName.toLowerCase() === tag.toLowerCase();
  };

  var type = selectorTypeMatcher(selector);
  var matchFunc;

  if (type === 'id') {
    matchFunc = function(elem) {
      return elem.id === selector.slice(1);
    }
  }
  if (type === 'class') {
    matchFunc = function(elem) {
      return matchClass(elem, selector.slice(1))
    }
  }
  if (type === 'tag') {
    matchFunc = function(elem) {
      return matchTag(elem, selector)
    }
  }
  if (type === 'tag.class') {
    var parts = selector.split('.');
    var tag = parts[0];
    var _class = parts[1];
    matchFunc = function(elem) {
      return matchTag(elem, tag) && matchClass(elem, _class)
    }
  }

  return matchFunc;
}

function traverseDomAndCollectElements(matchFunc, startEl, resultSet) {
  resultSet = resultSet || [];
  if (typeof startEl === 'undefined') {
    startEl = document.body;
  }
  if (matchFunc(startEl)) {
    resultSet.push(startEl)
  }
  for (var i = 0; i < startEl.childNodes.length; i++) {
    if (startEl.childNodes[i].tagName) {
      traverseDomAndCollectElements(matchFunc, startEl.childNodes[i], resultSet);
    }
  }
  return resultSet;
}
//
function retChildNodes(elementsArray) {
  var res = [];
  elementsArray.forEach(function(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      res.push(el.childNodes[i]);
    }
  })
  return res;
}

function flatTraverseDom(matchFuncArr, currNodes) {
  var results;
  if (typeof currNodes === 'undefined') {
    // set all nodes from body to array
    currNodes = Array.prototype.slice.call(document.body.childNodes);
  }
  // iterate over matching functions, and then filter on currNodes
  // if match found, build array, and continue filtering if needed
  matchFuncArr.forEach(function(match) {
    results = currNodes.filter(function(node) {
      if (match(node)) {
        return node
      };
    });
    currNodes = retChildNodes(results);
  });
  return results;
}

function matchFunctions(selectors) {
  return selectors.filter(function(selector) {
    if (selector !== '>')
      return selector;
  }).map(function(el) {
    return matchFunctionMaker(el);
  });
}
// TODO: support selector input: $('input[type="text"]')
// $('input')[0].attributes.type

function findAttributes(elements, args) {
  var res = []
  console.log(elements, args)
  elements.forEach(function(element) {
    res.push(element)
  })
  return res;
}

// TODO: break up and return selectors if needed
function selectorParse(selector) {

  //types: single, multi, attr
  //sel: array of or single selector
  //args: if attr, then return arguments, attributes.type = 'text'
  //      {type: 'text'}
  if (selector.indexOf('>') !== -1) {
    var multiSelector = selector.split('>').map(function(item) {
      return item.trim()
    });
    return {
      type: 'multi',
      select: multiSelector,
      args: '>',
    };
  } else if (selector.indexOf('[') !== -1) {
    // ugh... terrible code below
    var selSplit = selector.split('[');
    selector = selSplit[0];
    var attr = selSplit[1].split('=')[0];
    var attrType = selSplit[1].split('=')[1].split(']')[0].split('"')[1];
    return {
      type: 'attr',
      select: selector,
      args: {
        attr: attr,
        type: attrType
      }
    }
  } else {
    return {
      type: 'single',
      select: selector,
      args: '',
    };
  }

}

function $(selector) {
  var elements, selectorMatchFunc;
  var selectorObj = selectorParse(selector);
  if (selectorObj.type === 'multi') {
    var matchFnsArr = matchFunctions(selectorObj.select);
    elements = flatTraverseDom(matchFnsArr);
  }
  if (selectorObj.type === 'single') {
    selectorMatchFunc = matchFunctionMaker.call(null, selectorObj.select);
    elements = traverseDomAndCollectElements(selectorMatchFunc);
  }
  if (selectorObj.type === 'attr') {
    selectorMatchFunc = matchFunctionMaker.call(null, selectorObj.select);
    console.log(selectorMatchFunc)
    elements = traverseDomAndCollectElements(selectorMatchFunc);
    console.log(elements)
      //console.log(selectorObj.select, elements)
      //foundAttr = findAttributes(attrElements, selectorObj.args);
      //return foundAttr;
  };
  return elements;
}
