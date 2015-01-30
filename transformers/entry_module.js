"use strict"

var _ = require('lodash');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var t = require('./util/node_types');

/**
 * Wraps top level component in root controller component
 *
 * @param {String} source
 * @returns {String} output
 */
module.exports = function(source) {

  var ast = esprima.parse(source);

  estraverse.replace(ast, {
    enter: function(node, parent){
      if (t.isTopLevelAPIRender(node)) {

        var chunk  = esprima.parse(
          'React.render(React.createElement(RootWrapper__DDL, null, PLACEHOLDER), document.body);'
        );

        var retNode = chunk.body[0].expression;

        retNode.arguments[0].arguments[2] = node.arguments[0];

        this.skip();
        return retNode;
      }
    },

    leave: function (node, parent) {
      if(node.type === 'Program'){

        var chunk = esprima.parse(
          'var RootWrapper__DDL = require("!jsx-loader!component-flow-loader/runtime_components/root_wrapper.js");'
        );

        node.body.unshift(chunk);
        return node;
      }
    }
  });
  return escodegen.generate(ast);

}