import type { Plugin } from 'esbuild';

export default function externalizeAllPackagesExcept(noExternals: string[]) {
	return <Plugin>{
		name: 'noExternal-plugin',
		setup(build) {
			if (noExternals.length > 0) {
				build.onResolve({ filter: /(.*)/ }, (args) => {
					if (
						args.kind === 'import-statement' &&
						!args.path.startsWith('.') &&
						!noExternals.includes(args.path.split('/')[0])
					) {
						return { path: args.path, external: true };
					}
				});
			}
		},
	};
}
