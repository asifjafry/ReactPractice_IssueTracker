//const webpack=require('webpack');

module.exports = {
  //entry: './src/App.jsx',
  mode: 'production',
  entry: {
	  app: './src/App.jsx',
	  vendor: ['react','react-dom','whatwg-fetch','react-router','react-router-dom','react-bootstrap','react-router-bootstrap'],
  },
  output: {
    path: __dirname + './static',//'C:/Asif Personal/Knowledge base/JS/Trials/PMS/static',
    filename: '[name].bundle.js',
	chunkFilename: 'vendor.bundle.js' 
  },
  plugins: [],
  optimization: {
	  splitChunks: {
		  minSize: 20000,
		cacheGroups: {
			default: {
				minChunks: 2,
				priority: -20,
				name: 'app'
				//reuseExistingChunck: true
			},
			//defaultVendor: false,
			common: {
				test: 'vendor',
				name: 'vendor',
				chunks: 'all',
				priority: 10
			}
		},
  },
  },
  devServer: {
	  port: 8000,
	  static: {
		  directory: 'static',
	  },
	  proxy: [{
		  context: ['/api'],
		  target: 'http://localhost:3000',
	  }],
	  historyApiFallback: true
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx$/,
		loader: 'babel-loader',
		options: {
			presets: ['@babel/preset-react','@babel/preset-env']
		}
      },
    ]
  }
};
