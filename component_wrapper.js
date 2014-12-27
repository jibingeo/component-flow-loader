
var React = require('react');
var _ = require('lodash');




var ComponentWrapper = React.createClass({

  getInitialState: function(){
    return {didChange: false};
  },


  componentWillReceiveProps: function(nextProps, nextState){



    if(!_.isEqual(nextProps.passedProps,this.props.passedProps)){
      this.setState({didChange: true});

      setTimeout(function(){
        this.setState({didChange: false});

      }.bind(this), 1000);
    }

  },



  render: function () {

    var z = this.props.ownerName.split('').map(function(e) { return e.charCodeAt(0);}).reduce(function(e,u) { return e + u;}, 0);


    var transform = null;



/*

    if(this.props.wrappedComponentName === 'MainSection'){
      transform = {"transform": "translateZ(25px)"};
    }
    if(this.props.wrappedComponentName === 'Header'){
      transform = {"transform": "translateZ(50px)"};
    }

    if(this.props.wrappedComponentName === 'Footer'){
      transform = {"transform": "translateZ(50px)"};
    }

    if(this.props.wrappedComponentName === 'TodoItem'){
      transform = {"transform": "translateZ(100px)"};
    }

*/

    transform = {"transform": "translateZ("+ z * .05  +"px)"};



    return (
      <div className="component-wrapper" style={transform}>

        <span>{this.state.didChange ? "CHANGED" : ""} </span>


      {JSON.stringify(_.omit(this.props.passedProps, 'children'))}

        {this.props.children}
      </div>
    );
  }
});

module.exports = ComponentWrapper;