import getConfig from "@pnpm/config"
import { mutateModules } from "@pnpm/core"
import readProjectManifest from "@pnpm/read-project-manifest"
import { createOrConnectStoreController } from "@pnpm/store-connection-manager"
import writeProjectManifest from "@pnpm/write-project-manifest"
import path from "path"

type AddPackagesOptions = {
  /** The directory of the project where the packages will be added */
  directory?: string
  /** Add the packages to dev dependencies */
  type?: "normal" | "dev" | "optional" | "peer"
}

export const addPackages = async (packages: string | string[], options?: AddPackagesOptions) => {
  const packagesArray = Array.isArray(packages) ? packages : [packages]
  const directory = options?.directory ?? process.cwd()
  const type = options?.type ?? "normal"

  const { manifest, fileName } = await readProjectManifest(process.cwd())

  const config = await getConfig({
    cliOptions: {},
    packageManager: {
      name: "yarn",
      version: "4.0.0",
    },
    workspaceDir: directory,
  })

  const storeController = await createOrConnectStoreController({ ...config.config })

  const projects = await mutateModules(
    [
      {
        manifest: manifest,
        allowNew: true,
        dependencySelectors: packagesArray,
        targetDependenciesField:
          type === "dev" ? "devDependencies" : type === "optional" ? "optionalDependencies" : "dependencies",
        mutation: "installSome",
        peer: type === "peer",
        pruneDirectDependencies: true,
        rootDir: directory,
      },
    ],
    {
      storeDir: storeController.dir,
      storeController: storeController.ctrl,
    }
  )

  await writeProjectManifest(path.resolve(directory, fileName), projects[0].manifest)
}
