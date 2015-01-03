

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
      <div className="data-log-item">
        <h3>{this.props.componentName + " - " + this.props.nodeId + " - " + this.props.timestamp + " - " + this.props.lifecyclePhase}</h3>
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




var DataLogPanel = React.createClass({
  getInitialState: function(){
    return{
      dataLog: []
    }
  },

  componentWillMount: function(){
    window.__DDL_EE__.on("data", this.handleLogData);
  },

  handleLogData: function(payload){
    var log = this.state.dataLog;
    log.unshift(payload);

    this.setState({dataLog: log});
  },

  render: function () {

    return (
      <div className="data-log-panel" >
        <div>
            {this.state.dataLog.map(function(d){
              return  <DataLogItem key={d.nodeId + d.timestamp.getMilliseconds()} {... d} />;
            })}
        </div>
      </div>
    );
    return null;
  }
});


module.exports = DataLogPanel;