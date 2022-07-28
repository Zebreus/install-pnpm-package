import { addPackage } from "addPackage"
import { readFile } from "fs/promises"
import path from "path"
import { runInDirectory } from "tests/runInDirectory"

describe.each([["pnpm" as const], ["npm" as const]])("%s is adding packages", packageManager => {
  test("Adding package does not crash", async () => {
    await runInDirectory(async dir => {
      await expect(addPackage("ora@latest", { directory: dir, packageManager })).resolves.not.toThrow()
    })
  }, 60000)

  test("Adding package to dependencies works", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, packageManager })
      const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
      expect(packageJson).toBeDefined()
      expect(packageJson.dependencies?.ora).toBeDefined()
      expect(packageJson.devDependencies?.ora).toBeUndefined()
      expect(packageJson.peerDependencies?.ora).toBeUndefined()
      expect(packageJson.optionalDependencies?.ora).toBeUndefined()
    })
  }, 60000)

  test("Adding package to dev dependencies works", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, type: "dev", packageManager })
      const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
      expect(packageJson).toBeDefined()
      expect(packageJson.dependencies?.ora).toBeUndefined()
      expect(packageJson.devDependencies?.ora).toBeDefined()
      expect(packageJson.peerDependencies?.ora).toBeUndefined()
      expect(packageJson.optionalDependencies?.ora).toBeUndefined()
    })
  }, 60000)

  test("Adding package to optional dependencies works", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, type: "optional", packageManager })
      const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
      expect(packageJson).toBeDefined()
      expect(packageJson.dependencies?.ora).toBeUndefined()
      expect(packageJson.devDependencies?.ora).toBeUndefined()
      expect(packageJson.peerDependencies?.ora).toBeUndefined()
      expect(packageJson.optionalDependencies?.ora).toBeDefined()
    })
  }, 60000)

  test("Adding package to peer dependencies works", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, type: "peer", packageManager })
      const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
      expect(packageJson).toBeDefined()
      expect(packageJson.dependencies?.ora).toBeUndefined()
      expect(packageJson.devDependencies?.ora).toBeDefined()
      expect(packageJson.peerDependencies?.ora).toBeDefined()
      expect(packageJson.optionalDependencies?.ora).toBeUndefined()
    })
  }, 60000)

  test("Adding an existing package to a different type of dependency moves them", async () => {
    await runInDirectory(async dir => {
      await addPackage("ora@latest", { directory: dir, type: "dev", packageManager })
      const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
      expect(packageJsonA.dependencies?.ora).toBeUndefined()
      expect(packageJsonA.devDependencies?.ora).toBeDefined()
      await addPackage("ora@latest", { directory: dir })
      const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
      expect(packageJsonB.dependencies?.ora).toBeDefined()
      expect(packageJsonB.devDependencies?.ora).toBeUndefined()
    })
  }, 60000)
})
