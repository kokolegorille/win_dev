import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
import RefreshPlugin from "@rspack/plugin-react-refresh";

// Pour pouvoir utiliser require
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
	context: __dirname,
	entry: {
		main: "./src/index.js"
	},
	resolve: {
		extensions: ["...", ".ts", ".tsx", ".js", ".jsx"]
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				type: "asset"
			},
			{
				test: /\.(css)$/,
				type: 'css/auto',
			},
			{
				test: /\.(sass|scss)$/,
				use: [
					{
						loader: 'sass-loader',
						options: {
							// using `modern-compiler` and `sass-embedded` together significantly improve build performance,
							// requires `sass-loader >= 14.2.1`
							api: 'modern-compiler',
							implementation: require.resolve('sass-embedded'),
						},
					},
				],
				// set to 'css/auto' if you want to support '*.module.(scss|sass)' as CSS Modules, otherwise set type to 'css'
				type: 'css/auto',
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: "builtin:swc-loader",
						options: {
							jsc: {
								parser: {
									syntax: "typescript",
									tsx: true
								},
								transform: {
									react: {
										runtime: "automatic",
										development: isDev,
										refresh: isDev
									}
								}
							},
							env: { targets }
						}
					}
				]
			}
		]
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			template: "./index.html",
			favicon: "./static/favicon.png",
			// THIS INTERFERE WITH HMR CSS!
			// publicPath: "./"
		}),
		new rspack.CopyRspackPlugin({
			patterns: [
				{
					from: 'static',
					to: "dist"
				},
			],
		}),
		isDev ? new RefreshPlugin() : null
	].filter(Boolean),
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets }
			})
		]
	},
	devServer: {
		port: 3000,
	},
	experiments: {
		css: true,
	}
});
