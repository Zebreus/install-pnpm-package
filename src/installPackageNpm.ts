// @ts-expect-error: No types available for arborist
import { Arborist } from "@npmcli/arborist"
import parseWantedDependency from "@pnpm/parse-wanted-dependency"
import { InstallPackageOptions } from "installPackage"

type ArboristOptions = {
  /** Array of package names to add */
  add?: Array<string>
  /** Array of package names to remove */
  rm?: Array<string>
  /** Array of package names to update
   *
   * Boolean of true indicates to update all
   *
   * Names must not contain a version
   */
  update?: Array<string> | true
  /** Does something */
  complete?: boolean
  /** Does something */
  preferDedupe?: boolean
  /** Does something */
  legacyBundling?: boolean
  /** Does something
   * Set to true by default
   */
  prune?: boolean
  /** Used when adding packages
   * dev => devDependencies
   * optional => optionalDependencies, dependencies
   * prod => dependencies'],
   * peerOptional => peerDependencies, devDependecies (if devDeps already exist)
   * peer => peerDependencies
   */
  saveType?: null | "dev" | "optional" | "prod" | "peerOptional" | "peer"
  /** Add packages also to bundle deps. Does nothing if saveType is "peer" or "peerOptional"  */
  saveBundle?: boolean
  /** Pass to constructor to disable node_modules generation */
  packageLockOnly?: boolean
  /** Pass to constructor to disable failing on peer dependency errors */
  force?: boolean
}

export const installPackageNpm = async (packages: string | string[], options?: InstallPackageOptions) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const type = options?.type ?? "normal"

  const saveType = {
    normal: "prod",
    dev: "dev",
    optional: "optional",
    peer: "peer",
  }[type]

  const arb = new Arborist({
    path: directory,
    packageLockOnly: true,
    force: true,
  } as ArboristOptions)

  await arb.loadActual({
    add: packagesArray,
    omit: [""],
    saveType: saveType,
  } as ArboristOptions)

  await arb.buildIdealTree({
    add: packagesArray,
    saveType: saveType,
  })

  if (saveType === "peer") {
    const wantedDependencies = packagesArray.map(packageName => parseWantedDependency(packageName).alias ?? "")

    arb.idealTree.package.devDependencies = wantedDependencies.reduce(
      (previous, name) => ({
        ...previous,
        [name]: arb.idealTree.package.peerDependencies[name],
      }),
      arb.idealTree.package.devDependencies ?? {}
    )
  }

  await arb.reify({ save: true, packageLockOnly: true })
}
