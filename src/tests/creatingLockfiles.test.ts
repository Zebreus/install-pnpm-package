import { checkForLockfiles } from "detectPackageManager"
import { runInDirectory } from "tests/runInDirectory"
import { addPackage } from ".."

describe.each([["pnpm" as const], ["yarn" as const], ["npm" as const]])("%s is creating lockfiles", packageManager => {
  test("Creates the correct lockfile", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, packageManager })
      const lockfiles = await checkForLockfiles(dir)
      expect(lockfiles.filter(({ exists }) => exists).filter(({ type }) => type === packageManager).length).toBeTruthy()
    })
  }, 60000)

  test("Creates no wrong lockfiles", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, packageManager })
      const lockfiles = await checkForLockfiles(dir)
      expect(lockfiles.filter(({ exists }) => exists).filter(({ type }) => type !== packageManager).length).toBe(0)
    })
  }, 60000)
})
