import type { Plugin } from 'esbuild';

export default function externalizeAllPackagesExcept(noExternals: string[]) {
	const getPackageName = (fullPath: string) => {
		const splits = fullPath.split('/');
		return fullPath.startsWith('@') ? splits.slice(0, 2).join('/') : splits[0];
	};

	return <Plugin>{
		name: 'noExternal-plugin',
		setup(build) {
			if (noExternals.length > 0) {
				build.onResolve({ filter: /(.*)/ }, (args) => {
					if (args.kind !== 'import-statement' || args.path.startsWith('.')) {
						return;
					}

					if (!noExternals.includes(getPackageName(args.path))) {
						return { path: args.path, external: true };
					}
				});
			}
		},
	};
}
