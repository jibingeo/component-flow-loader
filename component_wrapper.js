
var React = require('react/addons');
var _ = require('lodash');




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



      //TODO: this._rootNodeID is the id you can use to select the backing dom node and retrive it like this
      //document.querySelector('[data-reactid=".0.0.0.0.0.0.1.0"]')
      //make sure to emit that here so the data panel can pick it up

      window.__DDL_EE__.emit("data", this.props.wrappedComponentName, this.props.passedProps, nextProps.passedProps);


    }

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
