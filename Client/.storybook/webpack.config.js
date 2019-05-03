const path = require('path');
console.log(path.resolve('../'));

module.exports = {
	mode: 'development',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['css-loader']
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
				include: path.resolve(__dirname, '../scss')
			},
			{
				test: /\.png$/,
				loader: 'url-loader?limit=100000'
			},
			{
				test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?|(jpg|gif)$/,
				loader: 'file-loader'
			}
		]
	}
};
