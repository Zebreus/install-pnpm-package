import { addPackages } from "addPackages"
import { mkdir, readFile, rmdir, writeFile } from "fs/promises"
import path, { resolve } from "path"

const runInDirectory = async <T>(testFunction: (directory: string) => Promise<T>) => {
  const randomName = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5)
  const testdir = resolve(__dirname, randomName)

  const packagePath = resolve(__dirname, "./../../", "package.json")
  const lockfilePath = resolve(__dirname, "./../../", "pnpm-lock.yaml")

  const filesBefore = await Promise.all([readFile(packagePath, "utf8"), readFile(lockfilePath, "utf8")])

  await mkdir(testdir, { recursive: true })

  try {
    await writeFile(
      path.resolve(testdir, "package.json"),
      JSON.stringify({
        name: `test-${randomName}`,
        version: "1.0.0",
      })
    )

    const result = await testFunction(testdir)

    const filesAfter = await Promise.all([readFile(packagePath, "utf8"), readFile(lockfilePath, "utf8")])

    expect(filesBefore[0] === filesAfter[0]).toBe(true)
    expect(filesBefore[1] === filesAfter[1]).toBe(true)

    return result
  } finally {
    await rmdir(testdir, { recursive: true })
  }
}

test("Adding package does not crash", async () => {
  await runInDirectory(async dir => {
    await expect(addPackages("ora@latest", { directory: dir })).resolves.not.toThrow()
  })
})

test("Adding package to dependencies works", async () => {
  await runInDirectory(async dir => {
    await addPackages("ora@latest", { directory: dir })
    const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJson).toBeDefined()
    expect(packageJson.dependencies?.ora).toBeDefined()
    expect(packageJson.devDependencies?.ora).toBeUndefined()
    expect(packageJson.peerDependencies?.ora).toBeUndefined()
    expect(packageJson.optionalDependencies?.ora).toBeUndefined()
  })
})

test("Adding package to dev dependencies works", async () => {
  await runInDirectory(async dir => {
    await addPackages("ora@latest", { directory: dir, type: "dev" })
    const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJson).toBeDefined()
    expect(packageJson.dependencies?.ora).toBeUndefined()
    expect(packageJson.devDependencies?.ora).toBeDefined()
    expect(packageJson.peerDependencies?.ora).toBeUndefined()
    expect(packageJson.optionalDependencies?.ora).toBeUndefined()
  })
})

test("Adding package to optional dependencies works", async () => {
  await runInDirectory(async dir => {
    await addPackages("ora@latest", { directory: dir, type: "optional" })
    const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJson).toBeDefined()
    expect(packageJson.dependencies?.ora).toBeUndefined()
    expect(packageJson.devDependencies?.ora).toBeUndefined()
    expect(packageJson.peerDependencies?.ora).toBeUndefined()
    expect(packageJson.optionalDependencies?.ora).toBeDefined()
  })
})

test("Adding package to peer dependencies works", async () => {
  await runInDirectory(async dir => {
    await addPackages("ora@latest", { directory: dir, type: "peer" })
    const packageJson = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJson).toBeDefined()
    expect(packageJson.dependencies?.ora).toBeUndefined()
    expect(packageJson.devDependencies?.ora).toBeDefined()
    expect(packageJson.peerDependencies?.ora).toBeDefined()
    expect(packageJson.optionalDependencies?.ora).toBeUndefined()
  })
})

test("Adding an existing package to a different type of dependency moves them", async () => {
  await runInDirectory(async dir => {
    await addPackages("ora@latest", { directory: dir, type: "dev" })
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.ora).toBeUndefined()
    expect(packageJsonA.devDependencies?.ora).toBeDefined()
    await addPackages("ora@latest", { directory: dir })
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.ora).toBeDefined()
    expect(packageJsonB.devDependencies?.ora).toBeUndefined()
  })
})
