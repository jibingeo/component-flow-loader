"use strict"

var _ = require('lodash');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var t = require('./util/node_types');

/**
 * Instruments owned components by wrapping them with component that also receives a cloned copy of
 * the props provided by an owner component.
 *
 * NOTE: Current implementation only supports components that pass down JSON serializable data
 * due to how cloning is performed...
 *
 * @param {String} source
 * @returns {String} output
 */
module.exports = function (source) {

  var ast = esprima.parse(source);

  estraverse.replace(ast, {
    enter: function (node, parent) {

      if (t.isCreateElementCall(node)) {

        var wrapperTemplate = esprima.parse(
          [
            'React.createElement(ComponentWrapper__DDL, ',
            '  JSON.parse(JSON.stringify(PROPS_PLACEHOLDER)),',
            '  COMPONENT_PLACEHOLDER)'
          ].join('')
        );

        var retNode = wrapperTemplate.body[0].expression;

        retNode.arguments[1].arguments[0].arguments[0] = node.arguments[1];
        retNode.arguments[2] = node;

        //Prevent further traversal and ComponentWrapper wrapping
        this.skip();
        return retNode;
      }
    },

    leave: function (node, parent) {

      if (node.type === 'Program') {

        var beforeChunk = esprima.parse(
          'var ComponentWrapper__DDL = require("!jsx-loader!component-flow-loader/runtime_components/component_wrapper.js");'
        );

        node.body.unshift(beforeChunk);
        return node;
      }
    }
  });

  return escodegen.generate(ast);
}
