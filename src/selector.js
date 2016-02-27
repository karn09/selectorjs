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

function retChildNodes(elements) {
  var res = [];
  elements.forEach(function(el) {
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
    console.log(results)
    currNodes = retChildNodes(results);
  });
  return results;


  // var first = matchFuncArr[0];
  // var firstSet = [];
  // currNodes = currNodes;
  // for (var i = 0; i < currNodes.length; i++) {
  //   if (first(currNodes[i])) {
  //     firstSet.push(currNodes[i]);
  //   }
  // }
  // console.log(firstSet)
  //
  // var second = matchFuncArr[1];
  // var secondSet = [];
  // currNodes = retChildNodes(firstSet)
  // for (var i = 0; i < currNodes.length; i++) {
  //   if (second(currNodes[i])) {
  //     secondSet.push(currNodes[i]);
  //   }
  // }
  // console.log(secondSet);
  //
  // var third = matchFuncArr[2];
  // var thirdSet = [];
  // currNodes = retChildNodes(secondSet)
  // for (var i = 0; i < currNodes.length; i++) {
  //   if (third(currNodes[i])) {
  //     thirdSet.push(currNodes[i]);
  //   }
  // }
  // console.log(thirdSet) // no more found!
  //
}

function matchFunctions(selectors) {
  return selectors.filter(function(selector) {
    if (selector !== '>')
      return selector;
  }).map(function(el) {
    return matchFunctionMaker(el);
  });
}

function $(selector) {
  var elements;
  var selSplit = selector.split(' ');
  if (selSplit.length > 1) {
    var matchFns = matchFunctions(selSplit);
    elements = flatTraverseDom(matchFns);
  } else {
    var selectorMatchFunc = matchFunctionMaker.call(null, selector);
    elements = traverseDomAndCollectElements(selectorMatchFunc);
  }
  return elements;
}
