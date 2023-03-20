import type { Plugin } from 'esbuild';
import { createRequire } from 'node:module';
import { versions } from 'node:process';

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
							resolvePackageName(maybePackageName, {
								resolveDir: args.resolveDir,
							});
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

function resolvePackageName(
	maybePackageName: string,
	{ resolveDir }: { resolveDir: string }
) {
	// support pnp and yarn berry
	try {
		if (versions.pnp) {
			const pnpApi = (() => {
				try {
					return require('pnpapi');
				} catch {
					return createRequire(import.meta.url)('pnpapi');
				}
			})();
			for (const locator of pnpApi.getDependencyTreeRoots()) {
				const locPackage = pnpApi.getPackageInformation(locator);
				// could be naive implementation not strong checking
				if (locPackage.packageLocation.startsWith(resolveDir)) {
					const pkg = locPackage.packageDependencies.get(maybePackageName);
					if (!pkg) {
						throw new Error('not found');
					}
				}
			}
		} else {
			// probably this don't need to be resolved
			// as it may cause to resolve to transitive deps which is mistake
			// possible check if package.json includes this dependency may work too

			try {
				createRequire(import.meta.url).resolve(maybePackageName);
			} catch {
				require.resolve(maybePackageName);
			}
		}
	} catch (err) {
		throw err;
	}
}
