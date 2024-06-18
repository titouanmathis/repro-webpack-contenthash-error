/**
 * @type {import('webpack').Configuration}
 */
export default {
	entry: ['./src/app.js'],
	mode: 'production',
	output: {
		chunkFilename: '[name].[contenthash].js',
	},
	experiments: {
		css: process.env.WEBPACK_CSS === 'true',
	},
};
