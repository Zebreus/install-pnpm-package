import { checkForLockfiles } from "detectPackageManager"
import { runInDirectory } from "tests/runInDirectory"
import { addPackage } from ".."

describe.each([["pnpm" as const], ["npm" as const]])("%s is creating lockfiles", packageManager => {
  test("%s adds the correct lockfile", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, packageManager })
      const lockfiles = await checkForLockfiles(dir)
      expect(lockfiles.filter(({ exists }) => exists).filter(({ type }) => type === packageManager).length).toBeTruthy()
    })
  }, 60000)

  test("%s does not add the wrong lockfile", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, packageManager })
      const lockfiles = await checkForLockfiles(dir)
      expect(lockfiles.filter(({ exists }) => exists).filter(({ type }) => type !== packageManager).length).toBe(0)
    })
  }, 60000)
})
