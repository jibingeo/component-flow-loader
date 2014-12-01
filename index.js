var falafel = require('falafel');
var _  = require('lodash');


/**
 *
 * @param source - Component sourcecode
 * @returns {Array}
 *  [{ name: 'className', type: 'ReactPropTypes.string' },
 *   { name: 'id', type: 'ReactPropTypes.string' },
 *   { name: 'placeholder', type: 'ReactPropTypes.string' },
 *   { name: 'onSave', type: 'ReactPropTypes.func.isRequired' },
 *   { name: 'value', type: 'ReactPropTypes.string' } ]
 */

function parseProps(source){

  var parsedPropsArray

  falafel(source, function (node) {
    if (node.type === 'Property' && node.key.name === 'propTypes') {

      parsedPropsArray = _(node.parent.properties).filter(function (p) {
        return p.type == "Property" && p.key.name == "propTypes"
      }).map(function (n) {
       // console.log(self.request);
        return _.map(n.value.properties, function (e) {
          return {name: e.key.name, type: e.value.source()}
        });
      }).flatten().value();
    }
  });

  return parsedPropsArray;
}



module.exports = function(content) {

  var self = this;
  var output = "";


  if (!/node_modules/.test(this.context)){
    output = falafel(content, function (node) {
      if (node.type === 'Property' && node.key.name === 'render') {
        node.parent.properties
          .filter(function (p) {
            return p.type == "Property" && p.key.name == "render"
          })
          .map(function (p) {
            return p.value.body.body.filter(function (b) {
              return b.type === "ReturnStatement";
            })[0].argument;
          })
          .forEach(function (p) {
            p.update("React.createElement('div',  {style: {border: '3px solid red'}}, 'NAME: ' + this.constructor.displayName  +  ' PROPS: ' + JSON.stringify(this.props) +  '---STATE: ' + JSON.stringify(this.state), " + p.source() + "   )");
          });
      }
    });
  }

  else{
    output = content;
  }

  return "" + output;

}
