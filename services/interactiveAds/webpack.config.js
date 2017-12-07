const webpack = require('webpack'),
    path = require('path'),
    buildPath = path.join(__dirname, './build');

module.exports = env => {
    return {
        entry: {
            adpushup: path.join(__dirname, './src/', 'index.js')
        },
        output: {
            path: path.join(buildPath),
            filename: '[name].js'
        },
        plugins: env && env.ENVIRONMENT === 'production' ? [new webpack.optimize.UglifyJsPlugin()] : []
    };
};