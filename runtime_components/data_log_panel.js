

var React = require('react/addons');
var _ = require('lodash');

var jsDiff = require('diff');


var DataLogItem = React.createClass({

  propTypes:{
    prevData: React.PropTypes.object,
    nextData: React.PropTypes.object,
    componentName: React.PropTypes.string,
  },

  /*
  shouldComponentUpdate: function(){
    return false;

  },
*/


  _emitHover: function(eventType, nodeId){
    window.__DDL_EE__.emit(eventType, nodeId);
  },

  handleMouseOver: function(){
    this._emitHover("logitem-mouseover", this.props.nodeId);
  },

  handleMouseOut: function(){
    this._emitHover("logitem-mouseout", this.props.nodeId);
  },

  render: function () {

    var prevDataString = this.props.prevData !== null ? JSON.stringify(this.props.prevData, null, 2) : "";
    var nextDataString = this.props.nextData !== null ? JSON.stringify(this.props.nextData, null, 2) : "";

    var diff = jsDiff.diffWords(prevDataString, nextDataString);

    for (var i=0; i < diff.length; i++) {
      if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
        var swap = diff[i];
        diff[i] = diff[i + 1];
        diff[i + 1] = swap;
      }
    }

    return (
      <div className="data-log-item" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
        <h3>{this.props.componentName /*+ " -  OWNED BY: " + this.props.ownerName + " - " +  this.props.nodeId + " - " + this.props.timestamp + " - " + this.props.lifecyclePhase*/}</h3>
        <pre>
          {diff.map(function(e){
            if(e.removed){
              return <del>{e.value}</del>;
            }
            else if(e.added){
              return <ins>{e.value}</ins>;
            }
            else{
              return e.value;
            }
          })}
        </pre>
      </div>
    );

  }
});

/*

function scrollToTop(el, scrollDuration) {
  var scrollHeight = el.scrollHeight,
    scrollStep = Math.PI / ( scrollDuration / 15 ),
    cosParameter = scrollHeight / 2;
  var scrollCount = 0,
    scrollMargin,
    scrollInterval = setInterval( function() {
      if ( el.scrollTop != 0 ) {
        scrollCount = scrollCount + 1;
        scrollMargin = cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
        el.scrollTop = (scrollHeight - scrollMargin);
      }
      else clearInterval(scrollInterval);
    }, 15 );
}
*/


var DataLogPanel = React.createClass({
  getInitialState: function(){
    return{
      dataLog: []
    }
  },

  componentWillMount: function(){
    window.__DDL_EE__.on("data", this.handleLogData);
  },

  componentWillUpdate: function() {
    var node = this.getDOMNode();
    this.scrollHeight = node.scrollHeight;
    this.scrollTop = node.scrollTop;
  },

  componentDidUpdate: function() {
   // var node = this.getDOMNode();
   // node.scrollTop = this.scrollTop + (node.scrollHeight - this.scrollHeight);

    //scrollToTop(node, 1000);

  },



  handleLogData: function(payload){
    var log = this.state.dataLog;
    log.unshift(payload);

    this.setState({dataLog: log});
  },

  render: function () {

    return (
      <div className="data-log-panel" >
            {this.state.dataLog.map(function(d, i){
              return  <DataLogItem key={i} {... d} />;
            })}
      </div>
    );
    return null;
  }
});


module.exports = DataLogPanel;