"use strict"

var React = require('react/addons');
var _ = require('lodash');

var cx = React.addons.classSet;

var eventBus = require('./event_bus');


/**
 * Acts as a proxy component around all ReactComponents
 *
 * The transformation process wraps this around all owned components found in render methods, along with a cloned copy
 * of the props passed to those components (this.props) for the purposes of emitting the previous and
 * next props when a change in the prop data has occurred
 *
 * This wrapper also subscribes to the globally exposed event bus to react to interactions with the data_log_panel
 *
 */

var ComponentWrapper = React.createClass({

  getInitialState: function () {
    return {
      didChange: false,
      border: null,
      top: null,
      left: null,
      right: null,
      bottom: null,
      position: null
    };
  },

  componentWillMount: function () {
    this._subscribeLogEntryItemHover();
  },

  componentWillUnmount: function () {
    this._emitDataLogEntry("Unmount", this.props, null);
    this._unSubscribeLogEntryItemHover();
  },


  componentDidMount: function () {

    if (this.isMounted()) {
      this.setState({didChange: true,  boxShadow:"inset 0 0 0 3px red"});
    }

    setTimeout(function () {
      if (this.isMounted()) {
        this.setState({didChange: false, border: null});
      }
    }.bind(this), 500);

    this._emitDataLogEntry("Mount", null, this.props);
  },

  componentWillReceiveProps: function (nextProps, nextState) {

    if (!_.isEqual(nextProps, this.props)) {
      if (this.isMounted()) {
        this.setState({didChange: true});
      }
      setTimeout(function () {
        if (this.isMounted()) {
          this.setState({didChange: false, border: null});
        }
      }.bind(this), 500);
      this._emitDataLogEntry("ReceiveProps", this.props, nextProps);
    }
  },


  _emitDataLogEntry: function (lifecyclePhase, prevData, nextData) {
    eventBus.emit("data", {
      lifecyclePhase: lifecyclePhase,
      componentName: React.Children.only(this.props.children).type.displayName,
      ownerName: this._owner.constructor.displayName,
      prevData: _.omit(prevData, "children"),
      nextData: _.omit(nextData, "children"),
      nodeId: this._rootNodeID,
      timestamp: new Date()
    });
  },

  _onLogItemMouseOver: function (nodeid) {
    if (this._rootNodeID === nodeid) {
      if (this.isMounted()) {
        this.setState({didChange: true});
      }
    }
  },

  _onLogItemMouseOut: function (nodeid) {
    if (this._rootNodeID === nodeid) {
      if (this.isMounted()) {
        this.setState({didChange: false, border: null});
      }
    }
  },

  _subscribeLogEntryItemHover: function () {
    eventBus.on("logitem-mouseover", this._onLogItemMouseOver);
    eventBus.on("logitem-mouseout", this._onLogItemMouseOut);
  },

  _unSubscribeLogEntryItemHover: function () {
    eventBus.removeListener("logitem-mouseover", this._onLogItemMouseOver);
    eventBus.removeListener("logitem-mouseout", this._onLogItemMouseOut);
  },


  render: function () {

    var wrapperClass = cx({
        "component-wrapper": true,
        "changed": this.state.didChange
    });

    return (
      <div className={wrapperClass} style={{
        "transform": "translateZ(" + this._mountDepth * 3 + "px)",
        "height": this.state.height,
        "border": this.state.border,
        "top": this.state.top,
        "left": this.state.left,
        "right": this.state.right,
        "bottom": this.state.bottom,
        "position": this.state.position}}>
          {this.props.children}
      </div>
    );
  }
});

module.exports = ComponentWrapper;
