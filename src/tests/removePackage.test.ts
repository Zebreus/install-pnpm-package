import { addPackage } from "addPackage"
import { readFile } from "fs/promises"
import path from "path"
import { removePackage } from "removePackage"
import { runInDirectory } from "tests/runInDirectory"

test("Removing a package works", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeDefined()
    await expect(removePackage("lodash", { directory: dir })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeUndefined()
  })
})

test("Removing multiple package works", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage(["lodash", "underscore"], { directory: dir })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeDefined()
    expect(packageJsonA.dependencies?.underscore).toBeDefined()
    await expect(removePackage(["lodash", "underscore"], { directory: dir })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeUndefined()
    expect(packageJsonB.dependencies?.underscore).toBeUndefined()
  })
})

test("Removing a package from a dev dependency works", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir, type: "dev" })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeUndefined()
    expect(packageJsonA.devDependencies?.lodash).toBeDefined()
    await expect(removePackage("lodash", { directory: dir, type: "dev" })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeUndefined()
    expect(packageJsonB.devDependencies?.lodash).toBeUndefined()
  })
})

test("Removing a package with a type specified removes it only from that field", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir, type: "normal" })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeDefined()
    expect(packageJsonA.devDependencies?.lodash).toBeUndefined()
    await expect(removePackage("lodash", { directory: dir, type: "dev" })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeDefined()
    expect(packageJsonB.devDependencies?.lodash).toBeUndefined()
  })

  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir, type: "normal" })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeDefined()
    expect(packageJsonA.devDependencies?.lodash).toBeUndefined()
    await expect(removePackage("lodash", { directory: dir })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeUndefined()
    expect(packageJsonB.devDependencies?.lodash).toBeUndefined()
  })
})

test("Removing packages without specifying the type of dependency removes them from all dependencies", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir, type: "normal" })).resolves.not.toThrow()
    await expect(addPackage("underscore", { directory: dir, type: "dev" })).resolves.not.toThrow()
    await expect(addPackage("ramda", { directory: dir, type: "optional" })).resolves.not.toThrow()
    await expect(addPackage("ora", { directory: dir, type: "peer" })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeDefined()
    expect(packageJsonA.devDependencies?.lodash).toBeUndefined()
    await expect(removePackage(["lodash", "underscore", "ramda", "ora"], { directory: dir })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(
      packageJsonB.dependencies === undefined || Object.entries(packageJsonB.dependencies).length === 0
    ).toBeTruthy()
    expect(
      packageJsonB.devDependencies === undefined || Object.entries(packageJsonB.devDependencies).length === 0
    ).toBeTruthy()
    expect(
      packageJsonB.optionalDependencies === undefined || Object.entries(packageJsonB.optionalDependencies).length === 0
    ).toBeTruthy()
    expect(
      packageJsonB.peerDependencies === undefined || Object.entries(packageJsonB.peerDependencies).length === 0
    ).toBeTruthy()
  })
})

test("Removing a package from a peer dependency keeps it in the dev dependencies", async () => {})

test("Removing a dependency that is also a peer dependency also removes it as a peer dependency", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir, type: "peer" })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeUndefined()
    expect(packageJsonA.devDependencies?.lodash).toBeDefined()
    expect(packageJsonA.peerDependencies?.lodash).toBeDefined()
    await expect(removePackage("lodash", { directory: dir, type: "dev" })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeUndefined()
    expect(packageJsonB.devDependencies?.lodash).toBeUndefined()
    expect(packageJsonB.peerDependencies?.lodash).toBeUndefined()
  })
})

test("Removing a dependency with the wrong type keeps the peer dependency", async () => {
  await runInDirectory(async dir => {
    await expect(addPackage("lodash", { directory: dir, type: "peer" })).resolves.not.toThrow()
    const packageJsonA = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonA.dependencies?.lodash).toBeUndefined()
    expect(packageJsonA.devDependencies?.lodash).toBeDefined()
    expect(packageJsonA.peerDependencies?.lodash).toBeDefined()
    await expect(removePackage("lodash", { directory: dir, type: "normal" })).resolves.not.toThrow()
    const packageJsonB = JSON.parse(await readFile(path.resolve(dir, "package.json"), "utf8"))
    expect(packageJsonB.dependencies?.lodash).toBeUndefined()
    expect(packageJsonB.devDependencies?.lodash).toBeDefined()
    expect(packageJsonB.peerDependencies?.lodash).toBeDefined()
  })
})
