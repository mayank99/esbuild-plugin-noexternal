import type { Plugin } from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default function externalizeAllPackagesExcept(noExternals: string[]) {
	const getPackageName = (fullPath: string) => {
		const splits = fullPath.split('/');
		return fullPath.startsWith('@') ? splits.slice(0, 2).join('/') : splits[0];
	};

	return <Plugin>{
		name: 'noExternal-plugin',
		setup(build) {
			build.onResolve({ filter: /(.*)/ }, (args) => {
				if (
					args.kind !== 'import-statement' ||
					args.path.startsWith('.') ||
					args.path.startsWith('@/')
				) {
					return;
				}

				if (args.path) {
					const maybePackageName = getPackageName(args.path);
					if (!noExternals.includes(maybePackageName)) {
						try {
							require.resolve(maybePackageName);
						} catch {
							// if resolve fails, then it's not a real package.
							// could be a tsconfig path, so we won't externalize it
							return;
						}

						return { path: args.path, external: true };
					}
				}
			});
		},
	};
}
