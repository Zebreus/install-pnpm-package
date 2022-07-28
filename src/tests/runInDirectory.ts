import { mkdir, readFile, rmdir, writeFile } from "fs/promises"
import path, { resolve } from "path"

export const runInDirectory = async <T>(testFunction: (directory: string) => Promise<T>) => {
  const randomName = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5)
  const testdir = resolve(__dirname, randomName)

  const filesThatShouldNotGetModifiedDuringTesting = [
    "package.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "package-lock.json",
    "npm-shrinkwrap.json",
  ]

  const filepaths = filesThatShouldNotGetModifiedDuringTesting.map(file => resolve(__dirname, "./../../", file))

  const filesBefore = await Promise.all(filepaths.map(filepath => readFile(filepath, "utf8").catch(() => "")))

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

    const filesAfter = await Promise.all(filepaths.map(filepath => readFile(filepath, "utf8").catch(() => "")))

    expect(filesBefore).toEqual(filesAfter)

    return result
  } finally {
    await rmdir(testdir, { recursive: true })
  }
}
