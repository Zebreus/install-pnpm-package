import { addPackageNpm } from "addPackageNpm"
import { addPackagePnpm } from "addPackagePnpm"
import { PackageManager } from "detectPackageManager"
import { constants } from "fs"
import { access } from "fs/promises"
import path from "path"

export type AddPackageOptions = {
  /** The directory of the project where the packages will be added
   *
   * @default process.cwd()
   */
  directory?: string
  /** Specify the type of dependency. Peer dependencys also get added to the dev dependencies.
   *
   * `normal` => `dependencies`
   *
   * `dev` => `devDependencies`
   *
   * `optional` => `optionalDependencies`
   *
   * `peer` => `peerDependencies` __&__ `devDependencies`
   *
   * @default "normal"
   */
  type?: "normal" | "dev" | "optional" | "peer"
}

export type SelectPackageManagerOptions = {
  /** Select your preferred package manager.
   * If not set it will be detected automatically.
   * If it can not be detected it will fallback to `pnpm`
   */
  packageManager?: PackageManager
}

const detectPackageManager = async (
  directory: string,
  preferredChoice?: SelectPackageManagerOptions["packageManager"]
) => {
  if (preferredChoice) {
    return preferredChoice
  }

  const lockfiles = [
    { type: "yarn", file: "yarn.lock" },
    { type: "pnpm", file: "pnpm-lock.yaml" },
    { type: "npm", file: "package-lock.json" },
    { type: "npm", file: "npm-shrinkwrap.json" },
  ] as const
  const fileChecks = lockfiles.map(async lockfile => ({
    ...lockfile,
    exists: await access(path.resolve(directory, lockfile.file), constants.F_OK)
      .then(() => true)
      .catch(() => false),
  }))

  const fileCheckResults = await Promise.all(fileChecks)
  const packageManagersWithLockfiles = [
    ...new Set(fileCheckResults.filter(({ exists }) => exists).map(({ type }) => type)),
  ]

  return packageManagersWithLockfiles[0] ?? "pnpm"
}

export const addPackage = async (
  packages: string | string[],
  options?: AddPackageOptions & SelectPackageManagerOptions
) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const packageManager = await detectPackageManager(directory, options?.packageManager)

  const addPackageFunctions = {
    pnpm: addPackagePnpm,
    yarn: () => undefined,
    npm: addPackageNpm,
  }

  const addPackageFunction = addPackageFunctions[packageManager]

  return addPackageFunction(packagesArray, options)
}
