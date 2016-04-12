a11y-tests
==========

`a11y-tests` is a Javascript library for testing the basic accessibility of your website. It's customizable and framework-agnostic, so you can drop it into your existing code and integrate it quickly.

## Using the test framework

Include `a11y.js` in your project and call `window.$A11y.checkA11y(...)` to test your HTML. Calling `window.$A11y.checkA11y()` with no parameters will run all tests on the entire document, but `checksToRun` has three parameters that allow you to customize how tests are run:

- `domElem`: By default, `checkA11y` will run on the entire document. If you pass in a DOM element here, it'll only run tests on that element and all DOM nodes within it.
- `checksToRun`: By default, `checkA11y` will run every single test, or whatever's included in the `defaultChecksToRun` array. If you only want to run a subset of tests, pass in an array of their test tags.
- `dontShowErrors`: By default, `checkA11y` will put a red border around each element with an error on the page. Set this parameter to `true` if you'd rather not have that happen.




## Adding your own tests

Each test has its own unique tag. We've given all our tests a tag `A11Y_DOM_{{number}}`, but you may want to create your own tagging convention for custom tests.

1. Add your new test to the `testFunctions` object like so:
  
  ```
  testFunctions : {
    {{yourTestNameVariableHere}} : {
       "tag"  : {{yourTestTag}},
       "func" : function(domElem) {
          var errorArray = [];
          
          // add code here to test the given domElem and all its child nodes for
          // a particular error and add them to the errorArray if necessary
            
          return $A11y.util.formatOutput(errorArray, this.tag);
       }
    }
    ...
  }
  ```
  Helper functions should live in the `util` object.

2. In the `errorMessages` map, create a mapping between your test tag and a brief error message:

    ```
    errorMessages : {
      "A11Y_DOM_01": "All image tags require the presence of the alt attribute.",
      {{yourTestTag}}: {{a short helpful error message}}
      ...
    }
  ```

3. Add a longer explanation of the error and how to fix it in the examples documentation (coming soon!).
4. Add the test's tag name to the `defaultChecksToRun` array.
5. Test your tests! Add test cases to the `test.js` file.

## Contributors
- Jesse Hausler
- Michael Kohanfars
- Hong Li
- Cordelia McGee-Tubb
- Bhargav Venkataraman
