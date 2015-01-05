
var React = require('react');
var DataLogPanel = require('./data_log_panel');



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
        <div className={this.state.is3DView ? "viewport" : null}>
          <div className="rotate-wrapper" style={this.state.is3DView ? transformString: null}>
            {this.props.children}
          </div>
        </div>

        <div className="rotate-controls">
          {this.state.is3DView ?
          <div>
            <button onClick={this.toggleViewMode} className="toggle-view"> Toggle 2d View </button>
            <button className="left" onMouseDown={this.handleIncrementThetaY}> Left </button>
            <button className="right" onMouseDown={this.handleDecrementThetaY}> Right </button>
            <button className="back" onMouseDown={this.handleDecrementZ}> Back </button>
            <button className="forward" onMouseDown={this.handleIncrementZ}> Forward </button>
          </div>
            : <button className="toggle-view" onClick={this.toggleViewMode}> Toggle 3d View </button>}
        </div>

       <DataLogPanel />

      </div>
    );
  }
});

module.exports = RotateWrapper;