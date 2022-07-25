import { mkdir, readFile, rmdir, writeFile } from "fs/promises"
import path, { resolve } from "path"

export const runInDirectory = async <T>(testFunction: (directory: string) => Promise<T>) => {
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
