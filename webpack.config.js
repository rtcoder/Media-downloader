const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        'options/main': './src/options/main.ts',
        'downloader/main': './src/downloader/main.ts',
        'content-script/send_media': './src/content-script/send_media.ts',
        'background/background': './src/background/background.ts',
        theme: './src/theme.ts',
        'popup-dimensions': './src/popup-dimensions.ts',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
    },
};
