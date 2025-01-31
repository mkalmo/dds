const path = require('path');

module.exports = {

    mode: 'production', // development | production
    devtool: false,

    entry: ['./index.tsx'],

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'code.bundle.js',
    },

    module: {
        rules: [{
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'] // es5
                }
            }
        }]
    },
}