console.log(__dirname)
module.exports = {
    entry: './src/pane.jsx',
    output: {
        path: __dirname + '/src',
        filename: 'pane.js',
    },
    module: {
        loaders: [{
            test: /\.jsx$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
}