import getConfig from "@pnpm/config"
import { mutateModules } from "@pnpm/core"
import readProjectManifest from "@pnpm/read-project-manifest"
import { createOrConnectStoreController } from "@pnpm/store-connection-manager"
import writeProjectManifest from "@pnpm/write-project-manifest"
import path from "path"

type RemovePackageOptions = {
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

export const removePackage = async (packages: string | string[], options?: RemovePackageOptions) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const type = options?.type ?? "all"

  const { manifest, fileName } = await readProjectManifest(directory)

  const config = await getConfig({
    cliOptions: {
      dir: directory,
    },
    packageManager: {
      name: "yarn",
      version: "4.0.0",
    },
    workspaceDir: directory,
  })

  const storeController = await createOrConnectStoreController({
    ...config.config,
    dir: directory,
    workspaceDir: directory,
  })

  const projects = await mutateModules(
    [
      {
        manifest: manifest,
        dependencyNames: packagesArray,
        targetDependenciesField:
          type === "all"
            ? undefined
            : type === "dev"
            ? "devDependencies"
            : type === "optional"
            ? "optionalDependencies"
            : "dependencies",
        mutation: "uninstallSome",
        rootDir: directory,
      },
    ],
    {
      storeDir: storeController.dir,
      storeController: storeController.ctrl,
      useLockfile: true,
      saveLockfile: true,
      fixLockfile: true,
      lockfileDir: directory,
    }
  )

  console.log(projects[0].peerDependencyIssues)

  await writeProjectManifest(path.resolve(directory, fileName), projects[0].manifest)
}
