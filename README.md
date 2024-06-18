# Webpack 5.92.0 contenthash bug reproduction

Since 5.92.0, the following error appears when importing dynamic modules with the CSS experiment enabled: 

```
ERROR in Path variable [contenthash] not implemented in this context: [name].[contenthash].css
Error: Path variable [contenthash] not implemented in this context: [name].[contenthash].css
    at fn (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/TemplatedPathPlugin.js:98:11)
    at fn (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/TemplatedPathPlugin.js:63:17)
    at /Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/TemplatedPathPlugin.js:361:12
    at String.replace (<anonymous>)
    at replacePathVariables (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/TemplatedPathPlugin.js:354:14)
    at Hook.eval [as call] (eval at create (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/tapable/lib/HookCodeFactory.js:19:10), <anonymous>:7:16)
    at Compilation.getAssetPathWithInfo (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/Compilation.js:4911:40)
    at Compilation.getPathWithInfo (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/Compilation.js:4887:15)
    at /Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/webpack/lib/css/CssModulesPlugin.js:371:51
    at Hook.eval [as call] (eval at create (/Users/titouanmathis/Lab/repro-webpack-contenthash-error/node_modules/tapable/lib/HookCodeFactory.js:19:10), <anonymous>:17:16)

webpack 5.92.0 compiled with 1 error in 122 ms
```

This repository is a minimal reproduction of the error, it can be tested with the following commands:

- `npm run build`: build `src/app.js` without the CSS experiment enabled, the build is ok
- `npm run fail`: build `src/app.js` with the CSS experiment enabled, the build fails with the error mentioned above

The error seems to come from the `lib/css/CssModulesPlugin.js` file, line 363, the `modules` variable can be undefined. Moving the following lines inside the `if (modules !== undefined)` condition seems to fix the error.

```diff
diff --git a/lib/css/CssModulesPlugin.js b/lib/css/CssModulesPlugin.js
index 0825adb18..88d73fe8f 100644
--- a/lib/css/CssModulesPlugin.js
+++ b/lib/css/CssModulesPlugin.js
@@ -361,25 +361,25 @@ class CssModulesPlugin {
 
 					/** @type {CssModule[] | undefined} */
 					const modules = orderedCssModulesPerChunk.get(chunk);
-					const { path: filename, info } = compilation.getPathWithInfo(
-						CssModulesPlugin.getChunkFilenameTemplate(
-							chunk,
-							compilation.outputOptions
-						),
-						{
-							hash,
-							runtime: chunk.runtime,
-							chunk,
-							contentHashType: "css"
-						}
-					);
-					const publicPath =
-						compilation.outputOptions.publicPath === "auto"
-							? getUndoPath(filename, compilation.outputOptions.path, false)
-							: compilation.getAssetPath(compilation.outputOptions.publicPath, {
-									hash: compilation.hash
-							  });
 					if (modules !== undefined) {
+						const { path: filename, info } = compilation.getPathWithInfo(
+							CssModulesPlugin.getChunkFilenameTemplate(
+								chunk,
+								compilation.outputOptions
+							),
+							{
+								hash,
+								runtime: chunk.runtime,
+								chunk,
+								contentHashType: "css"
+							}
+						);
+						const publicPath =
+							compilation.outputOptions.publicPath === "auto"
+								? getUndoPath(filename, compilation.outputOptions.path, false)
+								: compilation.getAssetPath(compilation.outputOptions.publicPath, {
+										hash: compilation.hash
+								  });
 						result.push({
 							render: () =>
 								this.renderChunk({
```
