
var React = require('react');
var _ = require('lodash');




var ComponentWrapper = React.createClass({

  getInitialState: function(){
    return {
      didChange: false,
      color: 'green'
    };
  },

  componentDidMount: function(){

      var styles = getComputedStyle(this.refs.childComponent.getDOMNode());



    var fixedDescendants = $(this.refs.childComponent.getDOMNode()).find('*').filter(function() {
      return $(this).css("position") === 'fixed' || $(this).css("position") === 'absolute'
    });


    if(fixedDescendants.length > 0){

     // var height = $(window).height() - $(this.refs.childComponent.getDOMNode()).offset().top;
      this.setState({color: 'red', height: '600px'});
    }


    /*
    if( this.props.wrappedComponentName === 'MappingWizard'){


      var objHeight = 0;
      $.each($(this.refs.childComponent.getDOMNode()).children(), function(){
        objHeight += $(this).height();
      });


      debugger



    }
*/




    /*

    if( this.props.wrappedComponentName === 'MappingWizard'){


      debugger



    }


      if (styles.position === 'fixed'){

        console.log(this.props.wrappedComponentName + " is fixed");



      //  this.setState({height: styles.height});
        this.setState({height: "600px"});
      }


      */
  },


  componentWillReceiveProps: function(nextProps, nextState){

    if(this.props.wrappedComponentName === 'MainSection'){
      console.log(nextProps.passedProps);
    }

    if(!_.isEqual(nextProps.passedProps,this.props.passedProps)){

      if(this.isMounted()) {
        this.setState({didChange: true});
      }

      setTimeout(function(){
        if(this.isMounted()){
          this.setState({didChange: false});
        }


      }.bind(this), 1000);
    }

  },

  render: function () {

    var z = this.props.wrappedComponentName.split('').map(function(e) { return e.charCodeAt(0);}).reduce(function(e,u) { return e + u;}, 0);
    var transform = null;

    var child = React.addons.cloneWithProps(this.props.children, {
      ref: 'childComponent'
    });

    return (
      <div className="component-wrapper" style={{"transform": "translateZ("+ z * .05  +"px)", "height": this.state.height, "border": "1px solid " + this.state.color}}>
        {child}
      </div>
    );
  }
});

module.exports = ComponentWrapper;
