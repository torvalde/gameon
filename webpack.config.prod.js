var path = require('path');
var webpack = require('webpack');

// I'm running a very basic command to convert app.js => bundle.js. It looks like:
//
// webpack app.js bundle.js

module.exports = {
    module: {
        entry: './src/app.js',
        output: {
            filename: 'dist/bundle.js'
        },
        // The first error I encountered was:
        //
        // ERROR in ./~/pixi.js/package.json
        // Module parse failed: /Users/michael/Projects/webpack-pixi/node_modules/pixi.js/package.json Line 2: Unexpected token :
        // You may need an appropriate loader to handle this file type.
        //
        // Apparently something in pixi.js requires its package.json file. So let's
        // teach webpack how to load JSON files. We could restrict this to only recognizing
        // .json files in the pixi.js directory, but this is a generally useful feature
        // that we might need elsewhere in our build.
        loaders: [
            {
                test: /\.json$/,
                // We could restrict using json-loader only on .json files in the
                // node_modules/pixi.js directory, but the ability to load .json files
                // could be useful elsewhere in our app, so I usually don't.
                //include: path.resolve(__dirname, 'node_modules/pixi.js'),
                loader: 'json'
            }
        ],

        // The next errors I encountered were all like:
        //
        // ERROR in ./~/pixi.js/src/core/renderers/webgl/filters/FXAAFilter.js
        // Module not found: Error: Cannot resolve module 'fs' in /Users/michael/Projects/webpack-pixi/node_modules/pixi.js/src/core/renderers/webgl/filters
        // @ ./~/pixi.js/src/core/renderers/webgl/filters/FXAAFilter.js 3:9-22
        //
        // Here, webpack is telling us it doesn't recognize the "fs" module. pixi.js
        // is using node's fs module to read files from the file system and they're
        // expecting people to use Browserify/brfs in order to make this work in
        // browsers. They could be much better about this, and we could go and bother
        // them to write more portable code. But then we'd have to wait for them to
        // cut a new release before we can use their stuff. Isn't there anything we
        // can do in the meantime? Can we somehow use the brfs transform?
        //
        // Webpack lets us use postLoaders to specify a module loader that runs after
        // all other module loaders. In this case, we can use Browserify's brfs
        // transform as a final build step. Here, we restrict this loader to files in
        // the node_modules/pixi.js directory so it won't slow us down too much.
        postLoaders: [
            {
                include: path.resolve(__dirname, 'node_modules/pixi.js'),
                loader: 'transform/cacheable?brfs'
            }
        ]

    }
}