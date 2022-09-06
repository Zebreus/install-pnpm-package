// @ts-expect-error: No types available for arborist
import { Arborist } from "@npmcli/arborist"
// @ts-expect-error: No types available for arborist
import YarnLock from "@npmcli/arborist/lib/yarn-lock"
import parseWantedDependency from "@pnpm/parse-wanted-dependency"
import { rm } from "fs/promises"
import { InstallPackageOptions } from "installPackage"
import { resolve } from "path"

export const installPackageYarn = async (packages: string | string[], options?: InstallPackageOptions) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const type = options?.type ?? "normal"
  // const yarn = false

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
  })

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

  if (arb.idealTree && !arb.idealTree.meta.yarnLock) {
    arb.idealTree.meta.yarnLock = new YarnLock()
    arb.idealTree.meta.yarnLock.fromTree(arb.idealTree)
  }

  await arb.reify({ save: true, packageLockOnly: true })

  await rm(resolve(directory, "package-lock.json"), { force: true })
}
