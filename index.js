var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var _ = require('lodash');

var path = require('path');


//Matches: module.exports = SomeIdentifier
function isExportIdentifier(node) {

  return (node.type === 'AssignmentExpression' &&
  node.left.type === 'MemberExpression' &&
  node.left.property.name === 'exports' &&
  node.right.type === 'Identifier')
}


//Matches: var SomeModule = require('./some_module')
function isRequireDeclaration(node) {

  return (node.type === 'VariableDeclarator' &&
  node.init &&
  node.init.type === 'CallExpression' &&
  node.init.callee.name === 'require');
}


//Matches: var SomeComponent = React.createClass({})
function isComponentDeclaration(node) {
  return (
  node.type === 'VariableDeclaration' &&
  node.declarations[0] &&
  node.declarations[0].type === 'VariableDeclarator' &&
  node.declarations[0].init &&
  node.declarations[0].init.type === 'CallExpression' &&
  node.declarations[0].init.callee.type === 'MemberExpression' &&
  node.declarations[0].init.callee.property.name === 'createClass');
}


//Matches nodes for React.PropTypes.arrayOf(), React.PropTypes.shape() etc...
function isPropTypeFunction(node, funcName) {
  return (node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.property.name === funcName);
}

//Matches nodes for React.PropTypes.{$type} | where $type = string || number || bool etc...
function isPropTypePrimitiveType(node) {
  return (node.type === 'MemberExpression' &&
  node.object.type === 'MemberExpression' &&
  (node.property.name === 'string' ||
  node.property.name === 'number' ||
  node.property.name === 'bool' ||
  node.property.name === 'object' ||
  node.property.name === 'func' ||
  node.property.name === 'array' ||
  node.property.name === 'node' ||
  node.property.name === 'any'));

}


//Matches nodes for React.PropTypes.{$type}.isRequired | where $type = string || number || bool etc...
function isPropPrimitiveTypeIsRequiredNode(node) {
  return (node.type === 'MemberExpression' &&
  node.object.type === 'MemberExpression' &&
  node.object.object &&
  node.object.object.type === 'MemberExpression' &&
  (node.object.property.name === 'string' ||
  node.object.property.name === 'number' ||
  node.object.property.name === 'bool' ||
  node.object.property.name === 'object' ||
  node.object.property.name === 'func' ||
  node.object.property.name === 'array' ||
  node.object.property.name === 'node' ||
  node.object.property.name === 'any'));
}


//Matches on React.createElement(SomeCustomELement, ......) calls where the passed in element is an identifier (as opposed to "div" "ul" etc)
function isCreateCustomElementCall(node) {
  return (node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.property.name === 'createElement' &&
  node.arguments[0].type === 'Identifier')

}


function isPropsMemberExpression(node) {
  return (node.type === 'MemberExpression' &&
  node.object.type === 'MemberExpression' &&
  node.object.property.name === 'props')

}


function isPropTypesProperty(node) {
  return (node.type === 'Property' &&
  node.key.name === 'propTypes')
}


function isRenderMethodProperty(node) {
  return (node.type === 'Property' &&
  node.key.name === 'render')
}


//React.render(<TopLevelComponent />)
function isTopLevelAPIRender(node) {
  return (node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.object.name === 'React' &&
  node.callee.property.name === 'render')
}



/**
 * Transforms render methods
 * @param source
 * @returns {*}
 */
function tranformFile(source) {

  //[{componentName: 'MyComponent', childComponents: [], ...]
  var componentModels = [];

  var requireIdentifiers = [];
  var exportedIdentifier;


  var currentComponentModel;


  var ast = esprima.parse(source);

  var curComponent = "";


  estraverse.replace(ast, {
    enter: function (node, parent) {

      //**** AST Scan/collect functions ******


      //Wrap top level component in RotateWrapper component
      if (isTopLevelAPIRender(node)) {

        var wrapped = {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "React"
            },
            "property": {
              "type": "Identifier",
              "name": "createElement"
            }
          },
          "arguments": [
            {
              "type": "Identifier",
              "name": "RotateWrapper"
            },
            {
              "type": "Literal",
              "value": null
            },
            _.cloneDeep(node.arguments[0])
          ]
        };


        node.arguments[0] = wrapped;

        console.log(escodegen.generate(node));


        this.skip();
        return node;

      }


      //Going to traverse the component declaration subtree --
      //create a new object to store the owned child components that will get traversed
      if (isComponentDeclaration(node)) {

        curComponent = node.declarations[0].id.name;
        // console.log(node.declarations[0].id.name)
      }


      if (isCreateCustomElementCall(node)) {
        var cName = node.arguments[0].name;

        console.log(cName);

        var createElNode = _.cloneDeep(node);

        //AST chunk for: JSON.parse(JSON.stringify(oldObject))
        var cloneJSON = {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "JSON"
            },
            "property": {
              "type": "Identifier",
              "name": "parse"
            }
          },
          "arguments": [
            {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "JSON"
                },
                "property": {
                  "type": "Identifier",
                  "name": "stringify"
                }
              },
              "arguments": [
                createElNode.arguments[1]
              ]
            }
          ]
        };


        var propNode = {
          "type": "ObjectExpression",
          "properties": [
            {
              "type": "Property",
              "key": {
                "type": "Identifier",
                "name": "passedProps"
              },
              "value": cloneJSON,
              "kind": "init"
            },
            {
              "type": "Property",
              "key": {
                "type": "Identifier",
                "name": "wrappedComponentName"
              },
              "value": {
                "type": "Literal",
                "value": cName,
              },
              "kind": "init"
            },
            {
              "type": "Property",
              "key": {
                "type": "Identifier",
                "name": "ownerName"
              },
              "value": {
                "type": "Literal",
                "value": curComponent,
              },
              "kind": "init"
            }
          ]
        };


        var wrapped = {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "computed": false,
            "object": {
              "type": "Identifier",
              "name": "React"
            },
            "property": {
              "type": "Identifier",
              "name": "createElement"
            }
          },
          "arguments": [
            {
              "type": "Identifier",
              "name": "ComponentWrapper"
            },
            propNode,
            createElNode
          ]
        };

        //Prevent further traversal and ComponentWrapper wrapping
        this.skip();
        return wrapped;
      }


      if (isPropsMemberExpression(node)) {
        var usedPropName = node.property.name;

        /*
         if(currentComponentModel && !_.contains(currentComponentModel.usedProps, usedPropName)) {
         currentComponentModel.usedProps.push(usedPropName);
         }
         */
      }


      if (isRequireDeclaration(node)) {
        // requireIdentifiers.push(node.id.name);
      }
      ;

      if (isExportIdentifier(node)) {
        //exportedIdentifier = node.right.name;
      }


    },

    leave: function (node, parent) {

    }
  });


  return escodegen.generate(ast);
}


function getEntryArray(entry) {
  if (_.isString(entry)) {
    return [entry];
  }
  else if (_.isArray(entry)) {
    return _.filter(entry, function (e) {
      return e.indexOf("webpack") === -1
    });
  }
}


module.exports = function (source) {

  var self = this;
  var output = "";


  var resourcePath = this.resourcePath,
    filename = path.basename(resourcePath);


  if (/node_modules/.test(resourcePath)) {
    // Don't instrument 3rd party deps
    return source;
  }


  var cssPath = '/Users/opengov/WebstormProjects/DataflowDiagnosticsPOC/node_modules/dataflow-diagnostics-loader/style.css';
  var rotateWrapperPath = '/Users/opengov/WebstormProjects/DataflowDiagnosticsPOC/node_modules/dataflow-diagnostics-loader/rotate_wrapper.js';
  var componentWrapperPath = '/Users/opengov/WebstormProjects/DataflowDiagnosticsPOC/node_modules/dataflow-diagnostics-loader/component_wrapper.js';


  console.log("Instrumenting: ", filename);

  //Parse out all potential app entry points
  var entryPaths = !_.isPlainObject(this.options.entry) ?
    getEntryArray(this.options.entry) :
    _(this.options.entry).map(function (val, key) {
      return getEntryArray(val);
    }).flatten().value();


  //Return instrumented entry module that includes things needed for the components injected at runtime
  if (_.any(entryPaths, function (e) {
      return resourcePath.indexOf(e.replace(".", "")) !== -1
    })) {
    return ['window.ComponentWrapper = require("' + componentWrapperPath + '");',
            'window.RotateWrapper = require("' + rotateWrapperPath + '");',
            'var EventEmitter = require("events").EventEmitter;',
            'window.__DDL_EE__ = new EventEmitter();',
            'require("' + cssPath + '");',
            tranformFile(source)].join('\n\n');
  }
  else {
    return tranformFile(source);
  }


}
