import { addPackageNpm } from "addPackageNpm"
import { addPackagePnpm } from "addPackagePnpm"
import { addPackageYarn } from "addPackageYarn"
import { detectPackageManager, PackageManager } from "detectPackageManager"

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

export const addPackage = async (
  packages: string | string[],
  options?: AddPackageOptions & SelectPackageManagerOptions
) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const packageManager = await detectPackageManager(directory, options?.packageManager)

  const addPackageFunctions = {
    pnpm: addPackagePnpm,
    yarn: addPackageYarn,
    npm: addPackageNpm,
  }

  const addPackageFunction = addPackageFunctions[packageManager]

  return addPackageFunction(packagesArray, options)
}
