// @ts-expect-error: No types available for arborist
import { Arborist } from "@npmcli/arborist"
// @ts-expect-error: No types available for arborist
import { saveTypeMap } from "@npmcli/arborist/lib/add-rm-pkg-deps"
// @ts-expect-error: No types available for arborist
import YarnLock from "@npmcli/arborist/lib/yarn-lock"
import { rm } from "fs/promises"
import { resolve } from "path"
import { RemovePackageOptions } from "removePackage"

const defaultTypeMap = {
  dev: "devDependencies",
  optional: "optionalDependencies",
  prod: "dependencies",
  peerOptional: "peerDependencies",
  peer: "peerDependencies",
} as const

const withMessedUpTypemap = async <T>(
  tempTypemap: Record<keyof typeof defaultTypeMap, typeof defaultTypeMap[keyof typeof defaultTypeMap]>,
  action: () => T
) => {
  const typemap: Map<string, string> = saveTypeMap

  try {
    Object.entries(tempTypemap).forEach(([key, value]) => {
      typemap.set(key, value)
    })
    return await action()
  } finally {
    Object.entries(defaultTypeMap).forEach(([key, value]) => {
      typemap.set(key, value)
    })
  }
}

export const removePackageYarn = async (packages: string | string[], options?: RemovePackageOptions) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const type = options?.type ?? "all"

  const arb = new Arborist({
    path: directory,
    packageLockOnly: true,
    force: true,
  })

  await arb.loadActual()

  const typemap =
    type === "dev"
      ? ({
          dev: "devDependencies",
          optional: "devDependencies",
          prod: "devDependencies",
          peerOptional: "devDependencies",
          peer: "peerDependencies",
        } as const)
      : type === "normal"
      ? ({
          dev: "dependencies",
          optional: "dependencies",
          prod: "dependencies",
          peerOptional: "dependencies",
          peer: "dependencies",
        } as const)
      : type === "optional"
      ? ({
          dev: "optionalDependencies",
          optional: "optionalDependencies",
          prod: "optionalDependencies",
          peerOptional: "optionalDependencies",
          peer: "optionalDependencies",
        } as const)
      : defaultTypeMap

  await withMessedUpTypemap(
    typemap,
    async () =>
      await arb.buildIdealTree({
        rm: packagesArray,
      })
  )

  if (arb.idealTree && !arb.idealTree.meta.yarnLock) {
    arb.idealTree.meta.yarnLock = new YarnLock()
    arb.idealTree.meta.yarnLock.fromTree(arb.idealTree)
  }

  await arb.reify({ save: true, packageLockOnly: true })

  await rm(resolve(directory, "package-lock.json"), { force: true })
}
