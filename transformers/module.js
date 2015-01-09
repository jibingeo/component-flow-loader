"use strict"

var _ = require('lodash');
var esprima = require('esprima');
var estraverse = require('estraverse');
var escodegen = require('escodegen');

var t = require('./util/node_types');

/**
 * Instruments owned components by wrapping them with component that also receives a cloned copy of
 * the props provided by a parent.
 *
 * NOTE: Current implementation only supports components that pass down JSON serializable data
 * due to how cloning is performed...
 *
 * @param {String} source
 * @returns {String} output
 */
module.exports = function(source) {

  var ast = esprima.parse(source);
  var curComponent = "";

  estraverse.replace(ast, {
    enter: function (node, parent) {

      if (t.isComponentDeclaration(node)) {
        curComponent = node.declarations[0].id.name;
      }

      if (t.isCreateCustomElementCall(node)) {

        var parentName = curComponent;
        var componentName = node.arguments[0].name;
        var createElNode = _.cloneDeep(node);

        var wrapperTemplate = esprima.parse(
          [
            'React.createElement(ComponentWrapper__DDL, {',
            '  passedProps: JSON.parse(JSON.stringify(PROPS_PLACEHOLDER)),',
            '  wrappedComponentName: "COMPONENT_NAME_PLACEHOLDER",',
            '  ownerName: "OWNER_NAME_PLACEHOLDER"',
            '}, COMPONENT)'
          ].join('')
        );

        var retNode = wrapperTemplate.body[0].expression;

        retNode.arguments[1].properties[0].value.arguments[0].arguments[0] = createElNode.arguments[1];
        retNode.arguments[1].properties[1].value.value = componentName;
        retNode.arguments[1].properties[2].value.value = parentName;
        retNode.arguments[2] = createElNode;

        //Prevent further traversal and ComponentWrapper wrapping
        this.skip();
        return retNode;
      }
    },
    leave: function (node, parent) {

      if(node.type === 'Program'){

        var beforeChunk = esprima.parse(
          'var ComponentWrapper__DDL = require("dataflow-diagnostics-loader/runtime_components/component_wrapper.js");'
        );

        node.body.unshift(beforeChunk);
        return node;
      }
    }
  });

  return escodegen.generate(ast);
}
