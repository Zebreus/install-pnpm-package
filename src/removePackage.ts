import { SelectPackageManagerOptions } from "addPackage"
import { detectPackageManager } from "detectPackageManager"
import { removePackagePnpm } from "removePackagePnpm"

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

  const addPackageFunctions = {
    pnpm: removePackagePnpm,
    yarn: () => undefined,
    npm: () => undefined,
  }

  const addPackageFunction = addPackageFunctions[packageManager]

  return addPackageFunction(packagesArray, options)
}
