var _ = require('lodash');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');



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


//Matches on React.createElement(SomeCustomELement, ......) calls where the passed in element is an identifier (as opposed to "div" "ul" etc)
function isCreateCustomElementCall(node) {
  return (node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.property.name === 'createElement' &&
  node.arguments[0].type === 'Identifier')

}



/**
 * Transforms render methods
 * @param source
 * @returns {*}
 */
module.exports = function(source) {


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
