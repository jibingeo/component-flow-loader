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

        chunk.body[0].expression.arguments[0].arguments[2] = _.cloneDeep(node.arguments[0]);

        this.skip();
        return chunk;
      }
    },

    leave: function (node, parent) {
      if(node.type === 'Program'){

        var beforeChunk = esprima.parse(
          'var RootWrapper__DDL = require("dataflow-diagnostics-loader/runtime_components/root_wrapper.js");'
        );

        node.body.unshift(beforeChunk);
        return node;
      }
    }
  });
  return escodegen.generate(ast);

}