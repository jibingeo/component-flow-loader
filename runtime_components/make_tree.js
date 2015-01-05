module.exports = function (adjArr){
    var root = adjArr.filter(function(e){ return e.parent === null;})[0];
    function makeTreeImpl(arr, nodeName, parent, depth){

      //add depth info to adj list by mutation
      var node = arr.filter(function(e){ return ((e.name === nodeName) && (e.parent === parent))})[0].depth = depth;
      var children = arr.filter(function(e){ return e.parent === nodeName });

      if (children.length === 0){
        return {name: nodeName, children: [], parent: parent, depth: depth}
      }

      return {name: nodeName, children:  _.map(children, function(c){
        return makeTreeImpl(arr , c.name, c.parent, depth + 1)
      }), depth: depth}
    }
    return makeTreeImpl(adjArr, root.name, null, 0);
  }
