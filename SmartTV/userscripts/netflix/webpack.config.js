﻿'use strict';

var path = require('path');

module.exports = {
    context: __dirname,
    entry: './main.js',
    devServer: {
        contentBase: __dirname
    },
    output: {
        path: __dirname,
        publicPath: '/',
        filename: 'NetflixRemote_webpack.user.js'
    },
    module: {
        loaders: [
            { test: /\.(woff2?|ttf|eot|svg|png|jpg)(\?.*)?$/, loaders: ['url'] },
            { test: /\.jade$/, loaders: ['jade'] },
            { test: /\.sass$/, loaders: ['style', 'css?minimize', 'sass?indentedSyntax'] }
        ]
    }
};

if (process.env.NODE_ENV === 'development')
    module.exports.devtool = 'cheap-module-eval-source-map';
