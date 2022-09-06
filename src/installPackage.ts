import { detectPackageManager, PackageManager } from "detectPackageManager"
import { installPackageNpm } from "installPackageNpm"
import { installPackagePnpm } from "installPackagePnpm"
import { installPackageYarn } from "installPackageYarn"

export type InstallPackageOptions = {
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

export const installPackage = async (
  packages: string | string[],
  options?: InstallPackageOptions & SelectPackageManagerOptions
) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const packageManager = await detectPackageManager(directory, options?.packageManager)

  const installPackageFunctions = {
    pnpm: installPackagePnpm,
    yarn: installPackageYarn,
    npm: installPackageNpm,
  }

  const installPackageFunction = installPackageFunctions[packageManager]

  return installPackageFunction(packagesArray, options)
}
