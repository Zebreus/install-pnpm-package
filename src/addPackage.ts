import getConfig from "@pnpm/config"
import { mutateModules } from "@pnpm/core"
import readProjectManifest from "@pnpm/read-project-manifest"
import { createOrConnectStoreController } from "@pnpm/store-connection-manager"
import writeProjectManifest from "@pnpm/write-project-manifest"
import path from "path"

type AddPackageOptions = {
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

export const addPackage = async (packages: string | string[], options?: AddPackageOptions) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const type = options?.type ?? "normal"

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
        allowNew: true,
        dependencySelectors: packagesArray,
        targetDependenciesField:
          type === "dev"
            ? "devDependencies"
            : type === "optional"
            ? "optionalDependencies"
            : type === "peer"
            ? "devDependencies"
            : "dependencies",
        mutation: "installSome",
        peer: type === "peer",
        pruneDirectDependencies: true,
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

  await writeProjectManifest(path.resolve(directory, fileName), projects[0].manifest)
}
