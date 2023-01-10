# esbuild-plugin-noexternal

Will mark all npm packages as "external", except the ones passed to this plugin. Kinda like Vite's [`noExternal`](https://vitejs.dev/config/ssr-options.html#ssr-noexternal) option.

```
npm i esbuild-plugin-noexternal
```

```js
import esbuild from 'esbuild';
import externalizeAllPackagesExcept from 'esbuild-plugin-noexternal';

esbuild.build({
	// ...
	bundle: true,
	plugins: [externalizeAllPackagesExcept(['nanoid', 'slash' /*...*/])],
});
```
