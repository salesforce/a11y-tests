/* 
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license. 
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
window.$A11y = {
    /**
     * Runs a subset of, or all, accessibility tests and stores failing DOM elements in an array
     * @param {HTMLElement} startingElement Element to start from. If null, will test whole document
     * @param {String[]} checksToRun Array of function names to run. Defaults to run all
     * @param {Boolean} dontShowErrors Whether or not to show error state for error elements
     */
    checkA11y       : function(startingElement, highlightError, checksToRun, checksToSkip) {
        var errorArray = [];
        var index;
        var funcObject;
        // if user doesn't want to start at a specific element, test whole document
        if($A11y.util._isUndefinedOrNull(startingElement)) {
            startingElement = document;
        }

        // if user doesn't specify a subset of tests, set it to the default list
        if($A11y.util._isEmpty(checksToRun)) {
            checksToRun = Object.keys(this.errorMessages);
        }

        if(!$A11y.util._isEmpty(checksToSkip)){
           checksToRun = checksToRun.filter( function( el ) {
                   return checksToSkip.indexOf( el ) < 0;
            });
        }

        var tmpFuncArray = $A11y.testFunctions;
        var testFuncs = [];
      
        for(var funcLabel in tmpFuncArray) {
            funcObject = tmpFuncArray[funcLabel];
            var index = checksToRun.indexOf(funcObject["tag"]);
            if(index > -1) {
               testFuncs[index] = funcObject;
            }
        }

        // run core tests
        for(var i = 0;  i < testFuncs.length; i++) {
            funcObject = testFuncs[i];
            errorArray = errorArray.concat(funcObject["func"](startingElement));

        }

        if(highlightError) {
            $A11y.showErrors(errorArray);
        }

        return errorArray;
    },
    errorMessages    : {
        "A11Y_DOM_01": "All image tags require the presence of the alt attribute.",
        "A11Y_DOM_02": "There must be a one-to-one relationship between labels and inputs.",
        "A11Y_DOM_03": "Buttons must have non-empty text labels.",
        "A11Y_DOM_04": "Links must have non-empty text content.",
        "A11Y_DOM_05": "Text nodes must have color contrast of 4.5:1 for regular text or 3:1 for large text.",
        "A11Y_DOM_06": "All frames and iframes need non-empty titles.",
        "A11Y_DOM_07": "The head section must have a non-empty title element.",
        "A11Y_DOM_08": "Data table cells must be associated with data table headers.",
        "A11Y_DOM_09": "Fieldset must have a legend element.",
        "A11Y_DOM_10": "Radio buttons and checkboxes should be grouped within fieldsets.",
        "A11Y_DOM_11": "Non-interactive DOM elements should not have onclick events."
    },
    /**
     * Places data-a11y-error attribute on each DOM element with an error
     * and puts a solid red border around the elements to highlight them
     * @param {Object[]} errorArray An array of objects, each with a String error and an HTMLElement element
     */
    showErrors      : function(errorArray) {
        var error    = null;
        var errorEls = null;
        var errorMsg = null;
        for(var i = 0; i < errorArray.length; i++) {
            error = errorArray[i];
            errorEls = error.errorEls;
            errorTag = error.errorTag;
            errorEls.forEach(function(element){
                element.setAttribute("data-a11y-error", errorTag);
                element.style.border = "3px solid #da0000";
            })
            
        }
    },
    /**
     * this is where all of the functions adding in x-browser compat, and common functionality go
     */
    util : {
        /**
         * Returning an array of objects, which each contain the error tag and the HTML element.

         * @param {HTMLElement[]} errorArray Array of error elements
         * @param {String} errorTag the error tag
         * @returns {Object[]} array of objects containing error message and error elements
         */
        formatOutput : function(errorArray, errorTag) {
            
            if(this._isEmpty(errorArray)) return [];

            return {
                "errorMsg" : $A11y.errorMessages[errorTag],
                "errorEls" : errorArray,
                "errorTag" : errorTag
            };
        },

        /**
         * Checks if the object(s) are undefined or null
         * @param {...Object} The object(s) to check
         * @returns {Boolean} True if object is undefined or null, false otherwise
         */
        _isUndefinedOrNull : function() {

            //list of objects that are not null
            var notNullList = [];
            for(var i = 0; i < arguments.length; i++) {
                argument = arguments[i];
                if(argument === undefined || argument === null)
                    continue;
                else
                    notNullList.push(argument);
            }
            if(notNullList.length > 0)
                return false;
            else
                return true;
        },

        /**
         * 
         */
        _isEmpty : function(obj) {
            return this._isUndefinedOrNull(obj) || obj === '' || Array.isArray(obj) && obj.length === 0 || ((typeof obj != "string") && Object.getOwnPropertyNames(obj).length <= 0);
        },

        /**
         * Get the text content of a DOM node. Tries <code>innerText</code> followed by
         * <code>textContext</code>, followed by <code>nodeValue</code> to take browser differences into account.
         * @param {HTMLElement} node The node to get the text content from
         * @returns {String} The text content of the DOM node
         */
        _getText : function(node) {
            
            if(this._isUndefinedOrNull(node)) return null;

            var t;
            //text nodes
            if(node.nodeType === 3){
                t = node.nodeValue;
            } else {
                // chrome, safari, IE have this
                t = node.innerText;
                t = this._trim(t);

                // FF & chrome with visibility set to false
                if (node.textContent !== undefined) {
                    if(this._isEmpty(t)){
                        t = node.textContent;
                    }
                }

                // if its <style> innerText doesnt work so try cssText (for IE)
                if (node.tagName === "STYLE" && this._isEmpty(t) && !this._isUndefinedOrNull(node.styleSheet)) {
                    t = node.styleSheet.cssText;
                }
            }
            return t;
        },

        /** 
         * Trims whitespace from a string
         * @param {String} value The string to trim
         * @returns {String} The string trimmed of white space
         */
        _trim : function(value) {

            if(this._isUndefinedOrNull(value)) return null;

            return (value || "").replace(/^\s+|\s+$/g, '');
        },

        /**
         * Get the text content of a DOM element, trims it of whitespace, and check if its empty
         * @param {HTMLElement} element The element to get the text content from
         * @returns {Boolean} whether or not DOM element has any text (whitespace doesn't count)
         */
        _hasEmptyText : function(element) {

            if(this._isUndefinedOrNull(element)) return null;

            return this._trim(this._getText(element)) == "";
        },

        /**
         * Return value of an attribute of an element
         * @param {HTMLElement} element The element from which to retrieve data
         * @param {String} attributeName The name of the attribute to look up on element
         * @returns {String} value of the given attribute
         */
        _getAttribute : function(element, attributeName) {

            if((this._isUndefinedOrNull(element)) || (this._isUndefinedOrNull(attributeName))) return null;

            var attrValue = element.getAttribute(attributeName);
            // for browser compatibility - getAttribute doesn't always work in IE
            if(this._isUndefinedOrNull(attrValue)){
                // gets list of attributes as they are written on the element.
                // the return value of this is going to be undefined
                attrValue = element.attributes[attributeName];

                // If the element does exist, then get its nodeValue.
                // If it doesn't exist, we will return null per Mozilla Standards,
                // and how the getAttribute method works normally
                if(!this._isUndefinedOrNull(attrValue)){
                    attrValue = attrValue.nodeValue;
                } else if(!this._isUndefinedOrNull(element[attributeName])) {
                    attrValue = element[attributeName];
                } else {
                    attrValue = null;
                }
            }
            return attrValue;

        },

        /**
         * Goes up the tree (until it reaches the body tag) and attempts to find element with specific tag
         * @param {HTMLElement} element The starting element that we are going to use to go up the tree
         * @param {String} ancestorTag Name of the tag that we should find as we traverse up the tree
         * @returns {HTMLElement} Closest ancestor matching that tag
         */   
        _getAncestorMatchingTag : function(element, ancestorTag) {

            if((this._isUndefinedOrNull(element)) || (this._isUndefinedOrNull(ancestorTag))) return null;

            ancestorTag = ancestorTag.toUpperCase();
            while(element && element.tagName && element.tagName !== "BODY")  {
                if(element.tagName.toUpperCase() === ancestorTag) {
                    return element;
                }
                element = element.parentNode;
            }
            return null;
        },

        /**
         * Function that goes through all labels and turns the for attribute into a key
         * @param {HTMLElement[]} labels All the labels that we want to go through
         * @returns {String[][]} Mapping of for attribute value to booleans
         */
        _getFormFieldsWithExplicitLabels : function(labels) {
            var fieldId = null;
            var dict = {};
            if(this._isUndefinedOrNull(labels)) {
               return dict; 
            }
        
            for(var i = 0; i < labels.length; i++) {
                var label = labels[i];
                fieldId = this._getAttribute(label, "for");
                // check that label explicitly references a field
                if(!this._isEmpty(fieldId)) {
                   dict[fieldId] = label;
                }
            }
            return dict;
        },

        /**
         * Get all elements of a certain type within a DOM element.
         * If the DOM element is of that type, just return that element.
         * @param {String} tagName
         * @param {HTMLElement} domElem
         * @return
         */
        _getElementsByTagName : function(tagName, domElem) {
           
            if((this._isUndefinedOrNull(tagName)) || (this._isUndefinedOrNull(domElem))) return [];

            tagName = tagName.toLowerCase();
            return (domElem.tagName && domElem.tagName.toLowerCase() == tagName) ? [domElem] : domElem.getElementsByTagName(tagName);
        },

        /**
         * Checks if given DOM element contains an image with non-empty alt
         * @param {HTMLElement} element The element to check
         * @return true if element contains an image with non-empty alt, false otherwise
         */
        _elementContainsImageWithNonEmptyAlt : function(element) {
           
            if(this._isUndefinedOrNull(element)) return null;

            var alt    = null;
            var images = element.getElementsByTagName("img");

            if(images.length > 0) {
                for (var i = 0; i < images.length; i++) {
                    alt = this._getAttribute(images[i], "alt");
                    if(!this._isEmpty(this._trim(alt))) return true;
                }
            }
            return false;
        },

        /**
         * Compute the luminance value of a color
         * @param color A rgb color
         * @returns luminance value
         */
        _computeLuminance : function (color) {
            var luminance, rgb = [];

            function getNum(num) {
                num /= 255;
                return 0.03928 >= num ? num / 12.92 : Math.pow((num + 0.055) / 1.055, 2.4);
            }

            if (color) {
                rgb = color.match(/\d+/g);
                if (rgb && rgb.length == 3) {
                    luminance = 0.2126 * getNum(rgb[0]) + 0.7152 * getNum(rgb[1]) + 0.0722 * getNum(rgb[2]);
                }
            }

            return luminance;
        },

        /**
         * Get computed style for a given DOM element
         * @param element a DOM element
         * @returns the element's style
         */
        _getComputedStyle : function(element) {
            var defaultView, style;
            defaultView = document.defaultView || window;
            if (defaultView.getComputedStyle && element instanceof Element)  {
                style = document.defaultView.getComputedStyle(element, null);
            }

            return style;
        },

        /**
         * Check if a text node meets the minimum requirement
         * 1. minimum ratio 3.0:1 for large font
         *       large font:
         *            1) size >= 19px and bold or semi-bold
         *            2) size >= 24px and normal
         * 2. minimum ratio 4.5:1 for normal font
         *       normal font:
         *            1) size < 19px and bold or semi-bold
         *            2) size < 24px and normal
          */
        _checkContrastRatio : function (element) {
            var style, size, weight, fontFamily, fgColor, bgColor, isBold, result = "";
            var fgLuminance, bgLuminance, minRatio, ratio;

            // get computed style for the node
            style = this._getComputedStyle(element);
            if (style) {
                weight = style.getPropertyValue("font-weight");
                fontFamily = style.getPropertyValue("font-family");
                size = style.getPropertyValue("font-size").match(/\d+/);
                fgColor = style.getPropertyValue("color");
                bgColor = this._getActualBackgroundColor(element);

                if (fgColor && bgColor !== "none") {
                    fgLuminance = this._computeLuminance(fgColor);
                    bgLuminance = this._computeLuminance(bgColor);

                    if (!fgLuminance || !bgLuminance) {
                        return result; // skip if we cannot get luminance
                    }

                    ratio = fgLuminance > bgLuminance ? (fgLuminance + 0.05) / (bgLuminance + 0.05) : (bgLuminance + 0.05) / (fgLuminance + 0.05);

                    if (weight && size) {
                        isBold = (weight === "bold") || (fontFamily.indexOf("bold") > -1);
                        if (size < 24 && !isBold) {
                            minRatio = 4.5;
                        } else if (size < 19 && isBold) {
                            minRatio = 4.5;
                        } else if (size >= 24 && !isBold) {
                            minRatio = 3.0;
                        } else if (size >= 19 && isBold) {
                            minRatio = 3.0;
                        }
                    } else {
                        minRatio = 4.5;
                    }

                    if (ratio < minRatio && ratio !== 1) {
                        function hex(num) {
                            return ("0" + parseInt(num).toString(16)).slice(-2);
                        }

                        // Convert rgb color to hex value
                        function rgbToHex(rgbValue) {
                            var rgbValArray = [];
                            if (rgbValue.search("rgb") == -1) {
                                return rgbValue;
                            } else {
                                rgbValArray = rgbValue.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                                if (rgbValArray) {
                                    return "#" + hex(rgbValArray[1]) + hex(rgbValArray[2]) + hex(rgbValArray[3]);
                                } else {
                                    return rgbValue;
                                }
                            }
                        }
                        weight = isBold ? "Bold" : "Normal";
                        result = "Error Tag: " + element.outerHTML + "\n - Expected Minimum Contrast Ratio: " + minRatio +
                            ":1\n - Actual Contrast Ratio: " + ratio + ":1\n - Foreground Color: " + rgbToHex(fgColor) +
                            "\n - Background Color: " + rgbToHex(bgColor) + "\n - Font Size: " + size + "px\n - Font Weight: " + weight + "\n";
                    }
                }
            }

            return result;
        },

        /**
         * Get the visible background color of an element,
         * taking into account opacity and parent elements
         * @param element a DOM element
         * @returns the background color
         */
        _getActualBackgroundColor : function(element) {
            var i, style, alpha, bgColor, rgb, sourceRgb, found = false;

            function computeCompositeColor(srcNum, srcAlpha, dstNum) {
                return srcNum * srcAlpha + (1 - srcAlpha) * dstNum;
            }

            while (element && "HTML" !== element.nodeName.toUpperCase() && !found) {
                style = this._getComputedStyle(element);

                if (!style) {
                    element = element.parentNode;
                } else {
                    // skip the check if there is backgroundImage
                    if (style.backgroundImage !== "none") { 
                        break;
                    }

                    bgColor = style.backgroundColor;

                    // if it doesn't have a background color, check its parent
                    if (!bgColor) {
                        element = element.parentNode;
                    // if it does have a background color, check its alpha
                    } else {
                        rgb = bgColor.match(/\d+/g);
                        alpha = (rgb && rgb.length == 4) ? rgb[3] : undefined;
                        switch(alpha) {
                            // element has opaque background color
                            case undefined:
                            case "1":
                                found = true;
                                break;
                            // element has transparent background color
                            case "0":
                                element = element.parentNode;
                                break;
                            // element has semi-transparent background color
                            default:
                                if (sourceRgb) {
                                    found = true;
                                } else {
                                    sourceRgb = rgb.slice(0);
                                    element = element.parentNode;
                                }
                        }
                    }
                }
            }

            // calculate composite background color based on opacity
            if (sourceRgb && found) {
                bgColor = "rgb(";
                for (i = 0; i < 3; i++) {
                    bgColor = bgColor + computeCompositeColor(sourceRgb[i], sourceRgb[3], rgb[i]) + ",";
                }
                bgColor = bgColor.slice(0, -1) + ")";
            }
            return (found) ? bgColor : "none";
        },


        /**
         * Check if an element is visible on the page
         * @param element A DOM element
         * @returns true if the element is visible, otherwise false
         */
        _isElementVisible : function (element) {
            var style, visibility, display, opacity, isVisible = false;
            var hiddenTextClass = "assistiveText";

            style = $A11y.util._getComputedStyle(element);
            if (style) {
                visibility = style.getPropertyValue("visibility");
                display = style.getPropertyValue("display");
                opacity = style.getPropertyValue("opacity");
                if ((visibility && visibility === "hidden") || (display && display === "none") || (opacity && opacity === "0")) {
                    isVisible = false;
                } else if ("HTML" === element.parentNode.nodeName.toUpperCase()) {
                    isVisible = true;
                } else {
                    isVisible = this._isElementVisible(element.parentNode);
                }
            }

            // special class that hides the element far off screen,
            // so it's accessible to screenreaders but not visible
            if(hiddenTextClass && element.className && element.className.indexOf && element.className.indexOf(hiddenTextClass) > -1) {
                isVisible = false;
            }

            return isVisible;
        }

    },
    /**
     * This is where all of our tests go
     **/
    testFunctions   : {
         /**
          * Check making sure that table cells have scope in them, and that they are equal to row, col, rowgroup, colgroup
          * @returns String - Returns a string representation of the errors
          */
         checkTableCellsHaveScope : {
            "tag"  : "A11Y_DOM_08", 
            "func" : function(domElem){
                 var hlprFunc = $A11y.util;
                 var headerDict = {};
                 var ths = [];
                 var scopeVal = "";
                 var idVals = "";
                 var errorArray = [];
                 var tmpErrorArray = [];
                 var i = 0, j = 0;
                 var skipTDCheck = false;
                 var allThsHaveScope = [];
                 var validScopes = {'row': false, 'col': false, 'rowgroup': false, 'colgroup' : false};
                 var tables = hlprFunc._getElementsByTagName("table", domElem);

                 for(var index = 0; index<tables.length; index++){
                    ths = tables[index].getElementsByTagName("th");

                    //Store all the previously found errors
                    errorArray = errorArray.concat(tmpErrorArray);
                    
                    //Reset Variables
                    tmpErrorArray = []
                    headerDict = {};
                    allThsHaveScope = [];
                    skipTDCheck = false;
                         
                    //If we have no headers, tds wont be a problem
                    if(ths.length === 0){
                        continue;
                    }
                         
                    //Phase 1:  If all <th> within a <table> contain scope attribute and scope attribute value is one of col, row, colgroup, rowgroup, then pass test. 
                    for(i = 0; i<ths.length; i++){                      
                       //Grab scope
                       scopeVal = hlprFunc._getAttribute(ths[i], "scope");
                       idVals   = hlprFunc._getAttribute(ths[i], "id");
                       
                       //If Scope exists
                       if(!hlprFunc._isEmpty(scopeVal)){
                          if(!(scopeVal in validScopes) || hlprFunc._trim(scopeVal) === ""){
                              tmpErrorArray.push(ths[i]);
                          }
                                 
                          skipTDCheck = true;   
                        }
                        else if(!hlprFunc._isEmpty(idVals)){
                            headerDict[idVals] = true;
                        }
                        else{
                            tmpErrorArray.push(ths[i]);
                        }
                    }
                         
                    //If we have already found an error with the THS (either they don't have an ID or they don't have a scope) skip the rest
                    if(!hlprFunc._isEmpty(tmpErrorArray) || skipTDCheck){
                        continue;
                    }
                               
                    //Phase 2: If all <th> within a <table> contain "id" and all <td> contain "headers" attribute, and each id listed in header attribute matches id attribute of a <th>, then pass test.
                    tds = tables[index].getElementsByTagName("td");
                         
                    if(tds.length === 0){
                        continue;
                    }
                    
                    for(i = 0; i<tds.length; i++){
                        idVals = hlprFunc._getAttribute(tds[i], "headers");
                        if(hlprFunc._isEmpty(idVals)){
                            tmpErrorArray.push(tds[i]);
                            continue;
                        }
                             
                        idVals = hlprFunc._trim(idVals).split(/\s+/);
                        for(j = 0; j<idVals.length; j++){
                            if(!(idVals[j] in headerDict)){
                                tmpErrorArray.push(tds[i]);
                                break;
                            }
                        }
                    }
                }

                //If there are any lingering errors, grab them
                if(tmpErrorArray.length > 0 ){
                   errorArray =  errorArray.concat(tmpErrorArray);
                }
                return $A11y.util.formatOutput(errorArray, this.tag);             
             }
        },
        /**
         * Check that images have alt attributes
         * @returns {Object[]} array of errors
         */
        checkImagesHaveAlts : {
            "tag"  : "A11Y_DOM_01",
            "func" : function(domElem) {
                var errorArray = [];
                var images     = $A11y.util._getElementsByTagName("img", domElem);

                for(var i = 0; i < images.length; i++) {
                    var image = images[i];
                    var alt   = image.getAttribute("alt");
                    // alt attribute isn't null
                    if(!$A11y.util._isUndefinedOrNull(alt)) {
                        alt = alt.toLowerCase().replace(/[\s\t\r\n]/g,'');
                        // alt attribute isn't silly
                        if(alt !== "undefined" && alt !== "null" && alt !== "empty" && alt !== "image") {
                            continue;
                        }
                    }
                    errorArray.push(image);
                }
                return $A11y.util.formatOutput(errorArray, this.tag);
            }
        },


        /**
         * Check that each input field has an associated label
         * and that there are no standalone labels.
         * Note that this test does not take into account ARIA labels.
         * @returns {Object[]} array of errors
         */
        checkInputsAndLabels : {
            "tag"  : "A11Y_DOM_02",
            "func" : function(domElem) {
                var errorArray = [];
                var formFields = domElem.querySelectorAll("input, select, textarea");
                var labels     = domElem.querySelectorAll("label");
                var usedLabels = [];
                var unusedLabels = [];
                var formField, type, ancestor, alt, label = null;
                var specialTypes = "hidden button submit reset";
                var explicitLabelDict = $A11y.util._getFormFieldsWithExplicitLabels(labels);

                // check that each input field has a label
                for (var i = 0; i < formFields.length; i++) {
                    formField = formFields[i];
                    type = $A11y.util._getAttribute(formField, "type");

                    // special input types can be ignored in this test
                    if(!$A11y.util._isEmpty(type) && specialTypes.indexOf(type) > -1) {
                        continue;
                    // image inputs require alt attributes
                    } else if (type == "image") {
                        // image inputs require alt attributes
                        var alt = $A11y.util._getAttribute(formField, "alt");
                        if($A11y.util._isEmpty(alt) || alt.replace(/[\s\t\r\n]/g,'') === "") {
                            errorArray.push(formField);
                        } else {
                            usedLabels.push(ancestor);
                        }
                    // form field has non-empty explicit label?
                    } else if(formField.id in explicitLabelDict) {
                        label = explicitLabelDict[formField.id];
                        if($A11y.util._hasEmptyText(label)) {
                            errorArray.push(formField);
                        }
                        usedLabels.push(label);
                    // form field has non-empty implicit label?
                    } else {
                        ancestor = $A11y.util._getAncestorMatchingTag(formField, "label");
                        // no implicit label
                        if($A11y.util._isUndefinedOrNull(ancestor)) {
                            errorArray.push(formField);
                        // empty implicit label
                        } else if ($A11y.util._hasEmptyText(ancestor)) {
                            errorArray.push(formField);
                            usedLabels.push(ancestor);
                        // non-empty implicit label
                        } else {
                            usedLabels.push(ancestor);
                        }
                    }
                }

                // check that there are no stand-alone labels
                for(var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    if(usedLabels.indexOf(label) < 0) {
                        errorArray.push(label);
                    }
                }

                return $A11y.util.formatOutput(errorArray, this.tag);
            }
        },

        /**
         * Check that buttons have non-empty text content
         * @returns {Object[]} array of errors
         */
        checkButtonsHaveText : {
            "tag"  : "A11Y_DOM_03", 
            "func" : function(domElem) {
                var errorArray   = [];
                var buttons      = $A11y.util._getElementsByTagName("button", domElem);

                var button      = null;
                var images      = null;
                var imageAlt    = null;
                var ariaLabel   = null;
                var foundText   = false;
                var text = null;
                var dict = {};
                var descendants = null;
                var descendant = null;
                for(var i = 0; i < buttons.length; i++) {  
                    dict = {};
                    button = buttons[i];
                    if(!$A11y.util._isUndefinedOrNull(button)) { 
                        // if button text is empty
                        if($A11y.util._hasEmptyText(button)) {
                            // check if button has non-empty aria-label
                            ariaLabel = $A11y.util._getAttribute(button, "aria-label");
                            if(!$A11y.util._isEmpty($A11y.util._trim(ariaLabel))) continue;

                            // check if button has an image with non-empty alt text
                            if($A11y.util._elementContainsImageWithNonEmptyAlt(button)) continue;
                            
                            errorArray.push(button);
                        }
                    }

                    descendants = $A11y.util._getElementsByTagName("*", button);
                    for(var j = 0; j < descendants.length; j++) {
                        text = null;
                        descendant = descendants[j];

                        text = $A11y.util._getText(descendant);
                        if(descendant.tagName == "IMG") {
                            text = $A11y.util._getAttribute(descendant, "alt");
                        }

                        if(dict[text]) {
                            errorArray.push(button);
                        } 
                        else {
                            dict[text] = true;
                        }
                    }

                }
                return $A11y.util.formatOutput(errorArray, this.tag);
            }
        },

        /**
         * Check that all anchors have text associated with them
         * @returns {Object[]} array of errors
         */
        checkAnchorsHaveText : {
            "tag"  : "A11Y_DOM_04", 
            "func" :  function(domElem){
                var errorArray = [];
                var anchors    = $A11y.util._getElementsByTagName("a", domElem);

                var anchor = null;
                for(var i = 0; i < anchors.length; i++) {
                    anchor = anchors[i];
                    // check that the anchor contains text or an image with alt text
                    if($A11y.util._hasEmptyText(anchor) 
                        && !$A11y.util._elementContainsImageWithNonEmptyAlt(anchor) 
                        && $A11y.util._getElementsByTagName("svg", anchor).length == 0) {
                        errorArray.push(anchor);
                    }
                }
                return $A11y.util.formatOutput(errorArray, this.tag);
            }
        },


        checkColorContrast: {
            "tag"  : "A11Y_DOM_05",
            "func" : function(domElem) {
                var errorArray = [];
                var textNodes  = [];
                var parentNode = null;

                function getTextNodes(element) {
                    if($A11y.util._isUndefinedOrNull(element)) return;
                    if(typeof element.getAttribute === "function") {
                        var ariaHidden = element.getAttribute("aria-hidden");
                        if (ariaHidden !== null && ariaHidden === "true") {
                            return;
                        }
                    }

                    // if this is a text node
                    if(element.nodeType == Node.TEXT_NODE || element.nodeType == 3) {
                        // check that it has text in it and is visible in viewport
                        if(!$A11y.util._isEmpty(element.nodeValue)) {
                            parentNode = element.parentNode;
                            if(parentNode
                               && parentNode.nodeName.toUpperCase() !== "SCRIPT" 
                               && parentNode.nodeName.toUpperCase() !== "STYLE"
                               && $A11y.util._isElementVisible(parentNode)) {
                                textNodes.push(parentNode);
                            }
                        }
                    // if it's not a text node, check its children to see if they are text nodes
                    } else {
                        for (var i = 0; i < element.childNodes.length; i++) {
                            getTextNodes(element.childNodes[i]);
                        }
                    }
                }//End of getTextNodes

                getTextNodes(domElem);
                for(var i = 0; i < textNodes.length; i++) {
                    result = $A11y.util._checkContrastRatio(textNodes[i]);
                    if(result) {
                        style = $A11y.util._getComputedStyle(textNodes[i]);
                        if(style) {
                            overflow = style.getPropertyValue("overflow");
                            if (!overflow || overflow !== "hidden") {
                                errorArray.push(textNodes[i]);
                            }
                        }
                    }
                }

                return $A11y.util.formatOutput(errorArray, this.tag);
            }
        },

        /**
         * Check that all iframes have a non empty title associated with them
         * @returns {Object[]} array of errors
         */
        checkIframesHaveTitles : {
            "tag"  : "A11Y_DOM_06", 
            "func" : function(domElem) {
                var errorArray = [];
                var iframes    = $A11y.util._getElementsByTagName("iframe", domElem);
                var iframe     = null;
                var title      = null;

                for(var i = 0; i < iframes.length; i++) {
                    iframe = iframes[i];
                    title = $A11y.util._getAttribute(iframe, "title");
                    if($A11y.util._isUndefinedOrNull(title) || $A11y.util._trim(title) === "") {
                        errorArray.push(iframe);
                    }
                }
                return $A11y.util.formatOutput(errorArray, this.tag);
             }
        },

        /**
         * Check that the <head> section of the page has a non-empty <title>
         * @returns {Object[]} array of errors
         */
        checkPageHasTitle : {
            "tag"  : "A11Y_DOM_07", 
            "func" : function(domElem) {
                var head = domElem.getElementsByTagName("head")[0];

                if($A11y.util._isEmpty(head)) return [];

                var title = head.getElementsByTagName("title")[0];
                if($A11y.util._isUndefinedOrNull(title) || $A11y.util._hasEmptyText(title)) {
                    return $A11y.util.formatOutput([head], this.tag);
                }

                return [];
            }
        },


        /**
         * Check to make sure that all fieldset tags have a legend and that it is not empty
         * @returns {Object[]} array of errors
         */
         checkFieldSetsAreCorrect : {
            "tag"  : "A11Y_DOM_09",
            "func" : function(domElem) {
                var errorArray = [];
                var legends = "";
                var fieldSets = $A11y.util._getElementsByTagName("fieldset", domElem);
                var fieldSetDisplay = "";

                for(var i = 0; i < fieldSets.length; i++) {
                    fieldSetDisplay = fieldSets[i].style.display;
                    legends = fieldSets[i].getElementsByTagName("legend");

                    if($A11y.util._isUndefinedOrNull(fieldSetDisplay) || fieldSetDisplay == "none") 
                         continue;

                    if(legends.length === 0) {
                        errorArray.push(fieldSets[i]);
                    }
                    else {
                        for(var j = 0; j < legends.length; j++) {
                            if($A11y.util._getText(legends[j]) == "") {
                                errorArray.push(fieldSets[i])
                            }
                        }
                    }
                }

                return $A11y.util.formatOutput(errorArray, this.tag);
            }
         },
       
       /**
         * Check to make sure that all radio buttons and checkboxes are grouped within a fieldset
         * @returns {Object[]} array of errors
         */
        checkRadioGrouping : {
            "tag"  : "A11Y_DOM_10",
            "func" : function(domElem) {
                var errorArray = [];
                var inputElem = null;
                var inputType = "";
                var rcName = ""; //value of name attribute of radio buttons and checkboxes
                var dict = {};
                var tempArray = [];
                var inputElems = $A11y.util._getElementsByTagName("input", domElem);

                for(var i = 0; i < inputElems.length; i++) {
                    inputElem = inputElems[i];
                    inputType = $A11y.util._getAttribute(inputElem, "type").toLowerCase();
                    if(inputType == "radio" || inputType == "checkbox") {
                        rcName = $A11y.util._getAttribute(inputElem, "name");
                        
                        if($A11y.util._isEmpty(rcName))
                            continue;
                        
                        if(!(rcName in dict)) {
                            dict[""+rcName] = [];
                        }

                        dict[rcName].push(inputElem);
                    }
                }

                for(rcName in dict) {
                    tempArray = dict[rcName];
                    if(tempArray.length >= 2) {
                        for(var i = 0; i < tempArray.length; i++) {
                            if(!$A11y.util._getAncestorMatchingTag(tempArray[i], "FIELDSET")) {
                                errorArray.push(tempArray[i])
                            }
                        }
                    }
                }
            return $A11y.util.formatOutput(errorArray, this.tag); 
            
            }
        },


        /**
         * Check to make sure that onClick is set only on acceptable elements
         * @returns {Object[]} array of errors
         */
         checkOnClick : {
            "tag" : "A11Y_DOM_11",
            "func" : function(domElem) {
                var errorArray = [];
                var allElements = $A11y.util._getElementsByTagName("*", domElem);
                if(!$A11y.util._isUndefinedOrNull(allElements)) {
                    for(var i = 0; i < allElements.length; i++) {
                        var element = allElements[i];
                        var elementTag = element.tagName;
                        if(allElements[i].hasAttribute("onclick")) {
                            if(elementTag != "A" &&
                               elementTag != "BUTTON" &&
                               elementTag != "INPUT" &&
                               elementTag != "CANVAS") {
                                errorArray.push(element);
                            }
                        }
                    }
                }

                return $A11y.util.formatOutput(errorArray, this.tag); 
            }
        }

    }
}