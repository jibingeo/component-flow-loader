# ComponentFlow (component-flow-loader)

A webpack loader for the instrumentation and analysis of data flow in a React application.

Used to demonstrate concepts from [my talk at React.js conf](http://conf.reactjs.com/schedule.html#unlocking-the-structure-of-your-react-applications-with-the-ast)




###Setup


**package.json**

Add the following entry to your `package.json`  (TODO: Publish to npm)

```
 "component-flow-loader": "git+ssh://git@github.com:gurdasnijor/component-flow-loader.git"
```


**webpack.config.js**

Here's an example of a webpack config file that uses the loader

```javascript
var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    './scripts/example'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: '/scripts/'
  }
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['component-flow', 'jsx'] },
    ]
  }
};
```
