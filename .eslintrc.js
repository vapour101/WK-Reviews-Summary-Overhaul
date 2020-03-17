module.exports = {
    root: true,
    env: {
        node: true,
        jquery: true
    },
    parser: "babel-eslint",
    extends: ["prettier"],
    plugins: ["prettier"],
    rules: {
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "prettier/prettier": "error"
    }
};
