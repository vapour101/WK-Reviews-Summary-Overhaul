module.exports = {
    root: true,
    env: {
        node: true,
        jquery: true,
    },
    parser: "babel-eslint",
    rules: {
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        indent: ["error", 4],
        semi: ["error", "always"],
        quotes: ["error", "double"]
    },
};
