"use strict"


var React = require('react');
var DataLogPanel = require('./data_log_panel');


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

    return (
      <div>
        <div className={this.state.is3DView ? "cfl_viewport" : null}>
          <div className="cfl_rotate-wrapper" style={this.state.is3DView ? transformString: null}>
            {this.props.children}
          </div>
        </div>

        <div className="cfl_rotate-controls">
          {this.state.is3DView ?
          <div>
            <button onClick={this.toggleViewMode} className="cfl_toggle-view"> Toggle 2d View </button>
            <button className="cfl_left" onMouseDown={this.handleIncrementThetaY}> Left </button>
            <button className="cfl_right" onMouseDown={this.handleDecrementThetaY}> Right </button>
            <button className="cfl_back" onMouseDown={this.handleDecrementZ}> Back </button>
            <button className="cfl_forward" onMouseDown={this.handleIncrementZ}> Forward </button>
          </div>
            : <button className="cfl_toggle-view" onClick={this.toggleViewMode}> Toggle 3d View </button>}
        </div>

        <DataLogPanel />

      </div>
    );
  }
});

module.exports = RotateWrapper;
