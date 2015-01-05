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


  //[{parent:'ParentCopnent', name:'ChildComponent'}..]
  var componentRelations = [];

  var ast = esprima.parse(source);

  var curComponent = "";


  estraverse.replace(ast, {
    enter: function (node, parent) {

      //Going to traverse the component declaration subtree --
      //create a new object to store the owned child components that will get traversed
      if (isComponentDeclaration(node)) {
        curComponent = node.declarations[0].id.name;
      }


      if (isCreateCustomElementCall(node)) {
        var cName = node.arguments[0].name;


        var createElNode = _.cloneDeep(node);
        componentRelations.push({parent: curComponent, name: cName});


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


      if (isRequireDeclaration(node)) {
        // requireIdentifiers.push(node.id.name);
      }


      if (isExportIdentifier(node)) {
        //exportedIdentifier = node.right.name;
      }


    },

    leave: function (node, parent) {

      if(node.type === 'Program'){

        var chunk = esprima.parse(
          [
            "global.__DDL_ADJLIST__ = global.__DDL_ADJLIST__  || [];",
            "global.__DDL_ADJLIST__ = global.__DDL_ADJLIST__.concat("+ JSON.stringify(componentRelations) +")"
          ].join("")
        );

        node.body.push(chunk);


        return node;

      }

    }
  });


  return escodegen.generate(ast);
}


function transformEntryModule(source) {
  var ast = esprima.parse(source);


  //Store the root component of the hierarchy
  //[{parent: null, name:'TopLevelComponent'}..]
  var componentRelations = [];

  estraverse.replace(ast, {
    enter: function(node, parent){
      //Wrap top level component in RotateWrapper component
      if (isTopLevelAPIRender(node)) {

        var rootComponentName = node.arguments[0].arguments[0].name;
        componentRelations.push({parent:null, name: rootComponentName});


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

        this.skip();
        return node;
      }
    },

    leave: function (node, parent) {

      if(node.type === 'Program'){

        //All declared vars here are temporary hacks in dev to workaround npm link issues
        var projName = 'DataflowDiagnosticsPOC';


        var cssPath = '/Users/opengov/WebstormProjects/'+projName+ '/node_modules/dataflow-diagnostics-loader/style.css';
        var rotateWrapperPath = '/Users/opengov/WebstormProjects/'+projName+ '/node_modules/dataflow-diagnostics-loader/rotate_wrapper.js';
        var componentWrapperPath = '/Users/opengov/WebstormProjects/'+projName+ '/node_modules/dataflow-diagnostics-loader/component_wrapper.js';
        var makeTreePath = '/Users/opengov/WebstormProjects/'+projName+ '/node_modules/dataflow-diagnostics-loader/make_tree.js';

        var beforeChunk = esprima.parse(
          [
            'window.ComponentWrapper = require("' + componentWrapperPath + '");',
            'window.RotateWrapper = require("' + rotateWrapperPath + '");',
            'var EventEmitter = require("events").EventEmitter;',
            'window.__DDL_EE__ = new EventEmitter();',
            'var computeDepth = require("' + makeTreePath + '");',
            'require("' + cssPath + '");',
            'global.__DDL_ADJLIST__ = global.__DDL_ADJLIST__  || [];',
            'global.__DDL_ADJLIST__ = global.__DDL_ADJLIST__.concat('+ JSON.stringify(componentRelations) + ')',
        ].join(""));


        var afterChunk = esprima.parse('computeDepth(global.__DDL_ADJLIST__);');

          node.body.unshift(beforeChunk);
          node.body.push(afterChunk);

          return node;
      }
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

  var resourcePath = this.resourcePath,
    filename = path.basename(resourcePath);


  if (/node_modules/.test(resourcePath)) {
    // Don't instrument 3rd party deps
    return source;
  }


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
    return transformEntryModule(source);
  }
  else {
    return tranformFile(source);
  }


}
