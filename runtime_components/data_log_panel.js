"use strict"

var React = require('react/addons');
var _ = require('lodash');
var jsDiff = require('diff');

var eventBus = require('./event_bus');

var DataLogItem = React.createClass({

  propTypes:{
    prevData: React.PropTypes.object,
    nextData: React.PropTypes.object,
    componentName: React.PropTypes.string,
  },


  shouldComponentUpdate: function(nextProps){
    return nextProps.nodeId !== this.props.nodeId;
  },

  _emitHover: function(eventType, nodeId){
    eventBus.emit(eventType, nodeId);
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
        <h3>{this.props.componentName + " -  OWNED BY: " + this.props.ownerName + " - " +  this.props.nodeId + " - " + this.props.timestamp + " - " + this.props.lifecyclePhase}</h3>
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
    eventBus.on("data", this.handleLogData);
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
          return  <DataLogItem key={d.timestamp.getTime() / 1000} {... d} />;
        })}
      </div>
    );
  }
});


module.exports = DataLogPanel;