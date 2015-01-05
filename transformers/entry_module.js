var _ = require('lodash');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');


//React.render(<TopLevelComponent />)
function isTopLevelAPIRender(node) {
  return (node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  node.callee.object.name === 'React' &&
  node.callee.property.name === 'render')
}



module.exports = function(source) {
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
              "name": "DDLRootWrapper"
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

        var beforeChunk = esprima.parse(
          [
            'window.ComponentWrapper = require("dataflow-diagnostics-loader/runtime_components/component_wrapper.js");',
            'var DDLRootWrapper = require("dataflow-diagnostics-loader/runtime_components/root_wrapper.js");',
            'var EventEmitter = require("events").EventEmitter;',
            'window.__DDL_EE__ = new EventEmitter();',
            'window.__DDL_EE__.setMaxListeners(0);',
            'var computeDepth = require("dataflow-diagnostics-loader/runtime_components/make_tree.js");',
            'require("dataflow-diagnostics-loader/style.css");',
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
