var _ = require('lodash');
var path = require('path');


var transformEntryModule = require('./transformers/entry_module');
var transformModule = require('./transformers/module');


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

  var resourcePath = this.resourcePath;
  var filename = path.basename(resourcePath);

  //Parse out all potential app entry points
  var entryPaths = !_.isPlainObject(this.options.entry) ?
    getEntryArray(this.options.entry) :
    _(this.options.entry).map(function (val, key) {
      return getEntryArray(val);
    }).flatten().value();

  var isEntryModule = _.any(entryPaths, function (e) {
    return resourcePath.indexOf(e.replace(".", "")) !== -1
  });


  if (this.cacheable) {
    this.cacheable();
  }

  if (/node_modules/.test(resourcePath)) {
    // Don't instrument 3rd party deps
    return source;
  }


  if(isEntryModule){
    console.log("Instrumenting entry module: ", filename);
    return transformEntryModule(source);
  }
  //Only transform source files that define components
  else if (source.match(/\React.createClass/)){
    console.log("Instrumenting module: ", filename);
    return transformModule(source);
  }
  else{
    return source;
  }
  
}
