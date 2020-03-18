const path = require("path");
const WebpackUserscript = require("webpack-userscript");
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
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    },
                    compress: false,
                    mangle: false
                }
            })
        ]
    },
    plugins: [
        new WebpackUserscript({
            headers: {
                name: displayName,
                include: "/^https://(www|preview).wanikani.com/review/?$/",
                grant: "none",
                require: "https://d3js.org/d3.v4.js"
            },
            pretty: true
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
            },
            {
                test: /\.html$/i,
                loader: "html-loader"
            }
        ]
    }
};
