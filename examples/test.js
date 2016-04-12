/* 
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license. 
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var testCases = [
  { 
    containerId : "A11Y_DOM_01",
    errors      : [{ 
      tag        : "A11Y_DOM_01", 
      elements   : ["image_fail1", "image_fail2"], 
      domSelector: "id" 
    }]
  },
  { 
    containerId : "A11Y_DOM_02",
    errors      : [{ 
      tag         : "A11Y_DOM_02", 
      elements    : ["input_fail1", "input_fail2", "input_fail3", "input_fail4", "input_fail5", "unassociated_label1", "unassociated_label2"],
      domSelector : "id" 
    }]
  },
  {
    containerId : "A11Y_DOM_03",
    errors      : [{
      tag         : "A11Y_DOM_01",
      elements    : ["img_button_fail"],
      domSelector : "id"
    },{
      tag         : "A11Y_DOM_03",
      elements    : ["button_fail1", "button_fail2", "button_fail3", "button_fail4"],
      domSelector : "id"
    }]
  },
  {
    containerId : "A11Y_DOM_04",
    errors      : [{
      tag         : "A11Y_DOM_01",
      elements    : ["img_anchor_fail"],
      domSelector : "id"
    },{
      tag         : "A11Y_DOM_04",
      elements    : ["anchor_fail1", "anchor_fail2", "anchor_fail3"],
      domSelector : "id"
    }]
  },
  {
    containerId : "A11Y_DOM_05",
    errors      : [{
      tag         : "A11Y_DOM_05",
      elements    : ["badContrast1", "badContrast2"],
      domSelector : "id"
    }]
  },
  {
    containerId : "A11Y_DOM_06",
    errors      : [{
      tag         : "A11Y_DOM_06",
      elements    : ["iframe_fail1", "iframe_fail2", "iframe_fail3"],
      domSelector : "id"
    }]
  },
  {
    containerId : "A11Y_DOM_08",
    errors      : [{
      tag         : "A11Y_DOM_08",
      elements    : ["tableWithWrongScopeValue_F", "tableWithNoScope_F", "tableWithMixedScopeSetInHeader_F","tableWithHeaderWoId_F","tableWithTdUsingWrongId_F","tableWithTdsWithNoHeader_F"],
      domSelector : "class"
    }]
  },
  {
    containerId : "A11Y_DOM_09",
    errors      : [{
      tag         : "A11Y_DOM_09",
      elements    : ["fieldSetNoLegend", "fieldSetEmptyLegend" ],
      domSelector : "id"
    }]
  },
  {
    containerId : "A11Y_DOM_10",
    errors      : [{
      tag         : "A11Y_DOM_10",
      elements    : ["radbad1", "radbad2", "radbad3", "chkbxbad1", "chkbxbad2", "chkbxbad4" ],
      domSelector : "id"
    }]
  },
  {
    containerId : "A11Y_DOM_11",
    errors      : [{
      tag         : "A11Y_DOM_11",
      elements    : ["divOnClick", "spanOnClick", "fieldsetOnClick" ],
      domSelector : "id"
    }]
  }
];

var getDomElements = function(identifiers, parent, getById) {
  var domElements = [];
  for(var i = 0; i < identifiers.length; i++) {
    var identifier = identifiers[i];
    domElements.push( getById ? document.getElementById(identifier) : parent.getElementsByClassName(identifier)[0]);
  }
  return domElements;
}

var runTests = function() {
  var results = null;

  for(var i = 0; i < testCases.length; i++) {
    var testCaseFails = false;
    var testCase  = testCases[i];
    var container = document.getElementById(testCase.containerId);

    // run checkA11y on the container DOM element for this test case
    console.log("\nStarting Test " + (i+1) + "...");
    results = $A11y.checkA11y(container, true);

    // iterate through each error type in the test case
    for(var j = 0; j < testCase.errors.length; j++) {
      var errorTypeFails   = false;
      var actualElements   = [];
      var expectedError    = testCase.errors[j];
      var expectedErrorTag = expectedError.tag;
      var expectedElements = getDomElements(expectedError.elements, container, expectedError.domSelector == "id");
      var logPrefix        = "> [" + expectedErrorTag + "] ";

      // find the right results set to compare to
      for (var k = 0; k < results.length; k++) {
        if(results[k].errorTag == expectedErrorTag) {
          actualElements = results[k].errorEls;
          break;
        }
      }
      // check that we've found the expected number of errors of this type
      if(expectedElements.length !== actualElements.length) errorTypeFails = true;

      // verify each expected element has the right data-a11y-error attribute
      for (var k = 0; k < expectedElements.length; k++) {
        var element = expectedElements[k];
        if(!$A11y.util._isUndefinedOrNull(element)) {
          var actualErrorTag = $A11y.util._getAttribute(element, "data-a11y-error");
          if(expectedErrorTag != actualErrorTag) {
            console.log(logPrefix + "Expected the following element to have data-a11y-error='" + expectedErrorTag + "'");
            console.log(element);
            errorTypeFails = true;
          }

          // TODO: check if it matches something in the actual array
        }
      }

      // log failures for this error type
      if(errorTypeFails) {
        console.log(logPrefix + "Expected " + expectedElements.length + " error element(s):");
        console.log(expectedElements);
        console.log(logPrefix + "Got " + actualElements.length + " error element(s):");
        console.log(actualElements);
        testCaseFails = true;
      }
    }

    // log success/failure for this test case
    if(testCaseFails) {
      console.log("> Bummer! This test failed.");
    } else {
      console.log("> Success! This test passed.");
    }
  }

};

var verifySkipTests = function(){
    var originalTestFunctions = $A11y.testFunctions;
    var funcTags = ["A11Y_DOM_01", "A11Y_DOM_02", "A11Y_DOM_03", "A11Y_DOM_04", "A11Y_DOM_06", "A11Y_DOM_07", "A11Y_DOM_08", "A11Y_DOM_09", "A11Y_DOM_10", "A11Y_DOM_15"];
    var expectedTags = ["A11Y_DOM_01", "A11Y_DOM_02", "A11Y_DOM_03", "A11Y_DOM_04"];
    var functions = {};

    for(var i = 0; i < funcTags.length; i++){
       var tagHolder = funcTags[i]; 
       functions[tagHolder] = 
          {
            "tag" : tagHolder,
            "func": function(){
              var tagHolderHolder = tagHolder
              return function(){
                  return [tagHolderHolder]
              }
             }()
          };

    }
    $A11y.testFunctions = functions;
    
    var tagsThatWereRun = $A11y.checkA11y(null, false, null, ["A11Y_DOM_06", "A11Y_DOM_07", "A11Y_DOM_08", "A11Y_DOM_09", "A11Y_DOM_10", "A11Y_DOM_15"])
    if(tagsThatWereRun.length != expectedTags.length){
      console.log("The tags that we expected to have returned ("+expectedTags.toString()+") are different that what was actually returned ("+tagsThatWereRun.toString()+")")
      $A11y.testFunctions = originalTestFunctions;
      return;
    }
    var errorTags = [];
    for(var i = 0; i < tagsThatWereRun.length; i++){
        if(expectedTags.indexOf(tagsThatWereRun[i]) < 0){
          errorTags.push(tagsThatWereRun[i]);
        }
    }

    if(errorTags.length > 0){
      console.log("These tags ("+errorTags.toString()+") were found and they should not have been");
      $A11y.testFunctions = originalTestFunctions;
      return;
    }
 
    $A11y.testFunctions = originalTestFunctions;
    console.log("CheckFunctions.verifySkipTests passed flawlessly");
};

var checkFunctions = function(){
    verifySkipTests();
};
