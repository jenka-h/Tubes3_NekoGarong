import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

export default {
    mode: 'production',
    entry: {
        bundle: './src/main.ts',          
        background: './src/background.ts',
        content: './src/content.ts'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.txt$/,
                type: 'asset/source',
            },
        ],
    },
    plugins: [
        new CopyPlugin({
        patterns: [
            { 
                from: 'manifest.json', 
                to: 'manifest.json'        
            },
        ],
        }),
    ],
};