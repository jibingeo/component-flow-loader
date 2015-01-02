

var React = require('react/addons');
var _ = require('lodash');

var jsDiff = require('diff');


var DataLogItem = React.createClass({

  propTypes:{
    prevData: React.PropTypes.object,
    nextData: React.PropTypes.object,
    componentName: React.PropTypes.string,
  },

  componentShouldUpdate: function(){
    return false;

  },

  render: function () {

    var prevDataString = JSON.stringify(this.props.prevData, null, 2);
    var nextDataString = JSON.stringify(this.props.nextData, null, 2);

    var diff = jsDiff.diffChars(prevDataString, nextDataString);

    for (var i=0; i < diff.length; i++) {
      if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
        var swap = diff[i];
        diff[i] = diff[i + 1];
        diff[i + 1] = swap;
      }
    }

    return (
      <div className="data-log-item">
        <h3>{this.props.componentName}</h3>
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

  handleLogData: function(name, prevData, nextData){
    var log = this.state.dataLog;
    log.unshift({name: name, prev: prevData, next: nextData});

    this.setState({dataLog: log});
  },

  render: function () {
    return (
      <div className="data-log-panel" >
        <div>
            {this.state.dataLog.map(function(d){
              return  <DataLogItem prevData={d.prev} nextData={d.next} componentName={d.name} />;
            })}
        </div>
      </div>
    );
  }
});


module.exports = DataLogPanel;