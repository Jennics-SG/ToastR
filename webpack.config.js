const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/toastr.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};