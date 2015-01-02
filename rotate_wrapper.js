
var React = require('react');


var RotateWrapper = React.createClass({

  getInitialState: function(){
    return {
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



  //translate3d(0, 0, 1000px)

  render: function () {

    var transformString = {"transform": "rotatey(" + this.state.rotationVector[1] + "deg) translate3d("+ this.state.translationVector[0] +"px, "+ this.state.translationVector[1] +"px, "+ this.state.translationVector[2]+"px)"}

    return (

      <div>
        <div className="viewport">
          <div className="rotate-wrapper" style={transformString}>
            {this.props.children}
          </div>
        </div>

        <div className="rotate-controls">

          <button className="left" onMouseDown={this.handleIncrementThetaY}> Left </button>
          <button className="right" onMouseDown={this.handleDecrementThetaY}> Right </button>

          <button className="back" onMouseDown={this.handleDecrementZ}> Back </button>
          <button className="forward" onMouseDown={this.handleIncrementZ}> Forward </button>


        </div>
      </div>
    );
  }
});

module.exports = RotateWrapper;