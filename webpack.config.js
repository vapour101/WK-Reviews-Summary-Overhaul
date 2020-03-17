const path = require("path");
const WebpackUserscript = require("webpack-userscript");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const displayName = require("./package.json").displayName;
const dev = process.env.NODE_ENV === "development";

module.exports = {
    mode: dev ? "development" : "production",
    entry: path.resolve(__dirname, "src", "index.js"),
    output: {
        filename: `${process.env.npm_package_name}.user.js`,
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new WebpackUserscript({
            headers: {
                name: displayName,
                include: "/^https://(www|preview).wanikani.com/review/?$/",
                grant: "none"
            },
            pretty: true
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: false,
                mangle: false,
                output: {
                    comments: false,
                    beautify: true
                }
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
};
