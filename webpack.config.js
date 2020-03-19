const path = require("path");
const WebpackUserscript = require("webpack-userscript");
const TerserPlugin = require("terser-webpack-plugin");
const displayName = require("./package.json").displayName;
const packageName = require("./package.json").name;
const dev = process.env.NODE_ENV === "development";

module.exports = {
    mode: dev ? "development" : "production",
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        filename: `${process.env.npm_package_name}.user.js`,
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        beautify: true,
                        braces: true,
                        comments: false,
                        ecma: 2017,
                        quote_style: 2
                    },
                    compress: {
                        arrows: false,
                        booleans: false,
                        comparisons: false,
                        ecma: 2017,
                        if_return: false,
                        join_vars: false,
                        keep_classnames: true,
                        keep_fargs: false,
                        keep_fnames: true,
                        keep_infinity: true,
                        negate_iife: false,
                        passes: 2,
                        pure_getters: true,
                        reduce_vars: false,
                        sequences: false,
                        typeofs: false
                    },
                    mangle: false,
                    ecma: 2017
                }
            })
        ]
    },
    plugins: [
        new WebpackUserscript({
            headers: {
                name: displayName,
                include: /^https?:\/\/(www|preview)\.wanikani\.com\/review\/?(\?|$)/.toString(),
                grant: "none",
                require: "https://d3js.org/d3.v4.js"
            },
            pretty: true
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/i,
                loader: "html-loader"
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: "style-loader",
                        options: {
                            esModule: true,
                            injectType: "singletonStyleTag",
                            attributes: {
                                id: `${packageName}-style`
                            }
                        }
                    },
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    }
};
