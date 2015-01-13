"use strict"

var React = require('react/addons');
var cx = React.addons.classSet;
var _ = require('lodash');


/**
 * Acts as a proxy component around all ReactComponents
 *
 * The transformation process wraps this around all owned components found in render methods, along with a cloned copy
 * of the props passed to those components (this.props.passedProps) for the purposes of emitting the previous and
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
    this._emitDataLogEntry("Unmount", this.props.passedProps, null);
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


    this._emitDataLogEntry("Mount", null, this.props.passedProps);

    //window.__DDL_EE__.emit("data", this.props.wrappedComponentName, null, this.props.passedProps);


    /*
     var styles = getComputedStyle(this.refs.childComponent.getDOMNode());

     var fixedDescendants = $(this.getDOMNode()).find('*').filter(function() {
     return $(this).attr('class') !== 'component-wrapper' && ($(this).css("position") === 'fixed' || $(this).css("position") === 'absolute');
     });



     if(fixedDescendants.length > 0){

     var $desc = $(fixedDescendants[0]);


     console.log("COPEIED CLASSANAME for  " + this.props.wrappedComponentName + "  ", $desc.attr('class'));

     this.setState({
     top: $desc.css("top"),
     left: $desc.css("left"),
     right: $desc.css("right"),
     bottom: $desc.css("bottom"),
     position: $desc.css("position")
     });
     */


  },

  componentWillReceiveProps: function (nextProps, nextState) {

    if (!_.isEqual(nextProps.passedProps, this.props.passedProps)) {
      if (this.isMounted()) {
        this.setState({didChange: true});
      }
      setTimeout(function () {
        if (this.isMounted()) {
          this.setState({didChange: false, border: null});
        }
      }.bind(this), 500);
      this._emitDataLogEntry("ReceiveProps", this.props.passedProps, nextProps.passedProps);
    }
  },


  _emitDataLogEntry: function (lifecyclePhase, prevData, nextData) {
    window.__DDL_EE__.emit("data", {
      lifecyclePhase: lifecyclePhase,
      componentName: this.props.wrappedComponentName,
      ownerName: this.props.ownerName,
      prevData: prevData,
      nextData: nextData,
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
    window.__DDL_EE__.on("logitem-mouseover", this._onLogItemMouseOver);
    window.__DDL_EE__.on("logitem-mouseout", this._onLogItemMouseOut);
  },

  _unSubscribeLogEntryItemHover: function () {
    window.__DDL_EE__.removeListener("logitem-mouseover", this._onLogItemMouseOver);
    window.__DDL_EE__.removeListener("logitem-mouseout", this._onLogItemMouseOut);
  },


  render: function () {

    var child = React.addons.cloneWithProps(this.props.children, {
      ref: 'childComponent'
    });

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
        "position": this.state.position
      }}>
        {child}
      </div>
    );
  }
});

module.exports = ComponentWrapper;
