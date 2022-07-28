import { constants } from "fs"
import { access } from "fs/promises"
import { resolve } from "path"

export type PackageManager = "npm" | "yarn" | "pnpm"

export const detectPackageManager = async (directory: string, preference?: PackageManager) => {
  if (preference) {
    return preference
  }

  const lockfiles = [
    { type: "yarn", file: "yarn.lock" },
    { type: "pnpm", file: "pnpm-lock.yaml" },
    { type: "npm", file: "package-lock.json" },
    { type: "npm", file: "npm-shrinkwrap.json" },
  ] as const
  const fileChecks = lockfiles.map(async lockfile => ({
    ...lockfile,
    exists: await access(resolve(directory, lockfile.file), constants.F_OK)
      .then(() => true)
      .catch(() => false),
  }))

  const fileCheckResults = await Promise.all(fileChecks)
  const packageManagersWithLockfiles = [
    ...new Set(fileCheckResults.filter(({ exists }) => exists).map(({ type }) => type)),
  ]

  return packageManagersWithLockfiles[0] ?? "pnpm"
}
