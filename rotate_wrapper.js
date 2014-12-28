
var React = require('react');


var RotateWrapper = React.createClass({

  getInitialState: function(){
    return {
      x: 0,
      y: 0,
      z: 0
    }
  },

  handleIncrementY:function(){
    this.setState({y: this.state.y + 20});
  },

  handleDecrementY:function(){

    this.setState({y: this.state.y - 20});

  },


  //translate3d(0, 0, 1000px)

  render: function () {

    var transformString = {"transform": "rotatey(" + this.state.y + "deg) translate3d(0, 0, -500px)"}

    return (

      <div>
        <div className="viewport">
          <div className="rotate-wrapper" style={transformString}>
            {this.props.children}
          </div>
        </div>

        <div className="rotate-controls">

          <button onMouseDown={this.handleIncrementY}> Left </button>
          <button onMouseDown={this.handleDecrementY}> Right </button>

        </div>
      </div>
    );
  }
});

module.exports = RotateWrapper;