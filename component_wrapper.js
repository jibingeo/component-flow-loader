
var React = require('react/addons');
var _ = require('lodash');


/**
 * Acts as a proxy component that is wrapped around
 */

var ComponentWrapper = React.createClass({

  getInitialState: function(){
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


  componentDidMount: function(){


    if(this.isMounted()) {
      this.setState({didChange: true, border: '1px solid red'});
    }

    setTimeout(function(){
      if(this.isMounted()){
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

  componentWillReceiveProps: function(nextProps, nextState){

    window.np = window.np || [];
    window.cp = window.cp || [];



    if(this.props.wrappedComponentName === 'MainSection'){


      console.log(nextProps.passedProps);

      window.np.push(nextProps.passedProps);
      window.cp.push(this.props.passedProps);
    }


    if(!_.isEqual(nextProps.passedProps,this.props.passedProps)){

      if(this.isMounted()) {
        this.setState({didChange: true, border: '1px solid red'});
      }

      setTimeout(function(){
        if(this.isMounted()){
          this.setState({didChange: false, border: null});
        }


      }.bind(this), 500);

      this._emitDataLogEntry("ReceiveProps", this.props.passedProps, nextProps.passedProps);
    }
  },


  componentWillUnmount: function(){
    this._emitDataLogEntry("Unmount", this.props.passedProps, null);
  },



  _emitDataLogEntry: function(lifecyclePhase, prevData, nextData){

    window.__DDL_EE__.emit("data", {
      lifecyclePhase: lifecyclePhase,
      componentName: this.props.wrappedComponentName,
      prevData: prevData,
      nextData: nextData,
      nodeId: this._rootNodeID,
      timestamp: new Date()
    });

  },



  render: function () {

    var z = this.props.wrappedComponentName.split('').map(function(e) { return e.charCodeAt(0);}).reduce(function(e,u) { return e + u;}, 0);
    var transform = null;

    var child = React.addons.cloneWithProps(this.props.children, {
      ref: 'childComponent'
    });


    return (
      <div className="component-wrapper" style={{
        "transform": "translateZ("+ z * .05  +"px)",
        "height": this.state.height,
        "border": this.state.border,
        "top": this.state.top,
        "left": this.state.left,
        "right": this.state.right,
        "bottom": this.state.bottom,
        "position": this.state.position}}>

        {child}

      </div>
    );
  }
});

module.exports = ComponentWrapper;
