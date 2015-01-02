

var React = require('react/addons');
var _ = require('lodash');




var DataLogPanel = React.createClass({
  getInitialState: function(){
    return{
      dataLog: []
    }
  },

  componentWillMount: function(){
    window.__DDL_EE__.on("data", this.handleLogData);
  },

  handleLogData: function(name, data){
    var prevData = this.state.dataLog;
    prevData.unshift({name: name, data: data});

    this.setState({dataLog: prevData});

    console.log(name, data);
  },

  render: function () {
    return (
      <div className="data-log-panel" >
        <div>
            {this.state.dataLog.map(function(d){
              return (
                <div className="data-log-item">
                  <h3>{d.name}</h3>
                  <pre>{JSON.stringify(d.data, null, 2)} </pre>
                </div>);
            })}
        </div>
      </div>
    );
  }
});


module.exports = DataLogPanel;