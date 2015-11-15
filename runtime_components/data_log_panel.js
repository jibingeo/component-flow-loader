"use strict"

var React = require('react');
var cx = require("classnames");
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
      <div className="cfl_data-log-item" onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut}>
        <header className="cfl_data-log-item-header">
          <h2>{this.props.componentName}</h2>
          <div className="cfl_dl">
            <span className="cfl_dt">Parent</span>
            <span className="cfl_dd">{this.props.ownerName}</span>
          </div>
          <div className="cfl_dl">
            <span className="cfl_dt">Node</span>
            <span className="cfl_dd">{this.props.nodeId}</span>
          </div>
          <div className="cfl_dl">
            <span className="cfl_dt">Time</span>
            <span className="cfl_dd">{this.props.timestamp.toString()}</span>
          </div>
          <div className="cfl_dl">
            <span className="cfl_dt">Lifecycle</span>
            <span className="cfl_dd">{this.props.lifecyclePhase}</span>
          </div>
        </header>
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
      dataLog: [],
      hidePanel: false
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

  handlePanelToggle: function(){
    this.setState({hidePanel: !this.state.hidePanel});
  },

  render: function () {
    var panelClassName = cx({
      "cfl_data-log-panel": true,
      "cfl_hide-panel": this.state.hidePanel
    });

    return (
      <div className={panelClassName}>
        <div className="cfl_panel-toggle" onClick={this.handlePanelToggle}>
          {this.state.hidePanel ? <span>&#10094;</span> : <span>&#10095;</span> }
        </div>
        <div className="cfl_scroll-container">
          {this.state.dataLog.map(function(d, i){
            return  <DataLogItem key={d.timestamp.getTime() / 1000} {... d} />;
          })}
        </div>
      </div>
    );
  }
});


module.exports = DataLogPanel;
