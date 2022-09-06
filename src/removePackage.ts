import { detectPackageManager } from "detectPackageManager"
import { SelectPackageManagerOptions } from "installPackage"
import { removePackageNpm } from "removePackageNpm"
import { removePackagePnpm } from "removePackagePnpm"
import { removePackageYarn } from "removePackageYarn"

export type RemovePackageOptions = {
  /** The directory of the project from which the packages will be removed
   *
   * @default process.cwd()
   */
  directory?: string
  /** Specify the type of dependency. To remove peer dependencies you have to keep thsi empty or select all
   *
   * `all` =>  `dependencies` & `devDependencies` & `optionalDependencies` & `peerDependencies`
   *
   * `normal` => `dependencies`
   *
   * `dev` => `devDependencies`
   *
   * `optional` => `optionalDependencies`
   *
   * @default "all"
   */
  type?: "all" | "normal" | "dev" | "optional"
}

export const removePackage = async (
  packages: string | string[],
  options?: RemovePackageOptions & SelectPackageManagerOptions
) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const packageManager = await detectPackageManager(directory, options?.packageManager)

  const installPackageFunctions = {
    pnpm: removePackagePnpm,
    yarn: removePackageYarn,
    npm: removePackageNpm,
  }

  const installPackageFunction = installPackageFunctions[packageManager]

  return installPackageFunction(packagesArray, options)
}
