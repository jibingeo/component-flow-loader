"use strict"


var React = require('react');
var cx = require('classnames');
var DataLogPanel = require('!jsx-loader!./data_log_panel');


require('!style!css!sass!autoprefixer!./style.scss');

var RotateWrapper = React.createClass({

  getInitialState: function(){
    return {
      is3DView: false,
      rotationVector: [0,0,0],
      translationVector: [0,0,-500]
    }
  },

  handleIncrementThetaY:function(){
    var vec = this.state.rotationVector.slice(0);
    vec[1] += 20;

    this.setState({rotationVector: vec});
  },

  handleDecrementThetaY:function(){
    var vec = this.state.rotationVector.slice(0);
    vec[1] -= 20;

    this.setState({rotationVector: vec});

  },

  handleIncrementZ:function(){
    var vec = this.state.translationVector.slice(0);
    vec[2] += 80;

    this.setState({translationVector: vec});

  },

  handleDecrementZ:function(){
    var vec = this.state.translationVector.slice(0);
    vec[2] -= 80;

    this.setState({translationVector: vec});

  },

  toggleViewMode: function(){
    this.setState({
      is3DView: !this.state.is3DView
    });
  },


  render: function () {
    var transformString = {"transform": "rotatey(" + this.state.rotationVector[1] + "deg) translate3d("+ this.state.translationVector[0] +"px, "+ this.state.translationVector[1] +"px, "+ this.state.translationVector[2]+"px)"}
    var rotateControlsClass = cx({
      "cfl_rotate-controls": true,
      "show-d-pad": this.state.is3DView
    });

    return (
      <div>
        <div className={this.state.is3DView ? "cfl_viewport" : null}>
          <div className="cfl_rotate-wrapper" style={this.state.is3DView ? transformString: null}>
            {this.props.children}
          </div>
        </div>

        <div className={rotateControlsClass}>
          <a onClick={this.toggleViewMode} className="cfl_toggle-view">
            {this.state.is3DView ? "2D" : "3D"}
          </a>
          <div className="cfl_d-pad">
            <div className="cfl_3d-control cfl_back" onMouseDown={this.handleDecrementZ}>&#9650;</div>
            <div className="cfl_3d-control cfl_forward" onMouseDown={this.handleIncrementZ}>&#9650;</div>
            <div className="cfl_3d-control cfl_left" onMouseDown={this.handleIncrementThetaY}>&#9650;</div>
            <div className="cfl_3d-control cfl_right" onMouseDown={this.handleDecrementThetaY}>&#9650;</div>
            <div className="cfl_center">&#9711;</div>
          </div>
        </div>

        <DataLogPanel />

      </div>
    );
  }
});

module.exports = RotateWrapper;
