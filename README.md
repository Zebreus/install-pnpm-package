# install-pnpm-package
Install packages using the pnpm API. 

Does not require pnpm to be installed, as it uses `@pnpm/core` directly. This way it also does not spawn a new process.

# Usage

```typescript
import { addPackages } from "install-pnpm-package"

// Install a node module
await addPackages("lodash")

// Install multiple node modules
await addPackages(["lodash", "underscore", "ramda"])

// Install a node module into a project in /projects/my-project
await addPackages("lodash", { directory: "/projects/my-project" })

// Install a node module into the project into the working directory
await addPackages("lodash")

// Install a node module as devDependencies
await addPackages("lodash", { type: "dev" })

// Install a node module as peerDependencies
await addPackages("lodash", { type: "peer" })


// Install a node module as optionalDependencies
await addPackages("lodash", { type: "optional" })
```

# Background

I want to install packages without spawning a new process for the package manager.

Initially I tried to use [`@yarnpkg/core`](https://github.com/yarnpkg/berry/tree/master/packages/yarnpkg-core) and [`@yarnpkg/plugin-essentials`](https://github.com/yarnpkg/berry/tree/master/packages/plugin-essentials), but they couple the UI and some of the functionality. Yarn uses a mix of an object oriented and a functional style, in which it took me quite a while to realize where the properties for `this` got defined. The [function that gets called on `yarn add ...`](https://github.com/yarnpkg/berry/blob/master/packages/plugin-essentials/sources/commands/add.ts#L122-L327) also does some prompts to the user and outputs information. There is [`project.install`](https://github.com/yarnpkg/berry/blob/master/packages/plugin-essentials/sources/commands/add.ts#L323) (defined [here](https://github.com/yarnpkg/berry/blob/master/packages/yarnpkg-core/sources/Project.ts#L1499)), which probably does what I want, but I did not investigate that further for now.

Instead I looked for an alternative package manager with an easier API. The other modern node package manager is [pnpm](https://github.com/pnpm/pnpm), so I started there. I skimmed through the pnpm git repo and found the [`mutateModules` function](https://github.com/pnpm/pnpm/blob/main/packages/core/src/install/index.ts#L157) in `@pnpm/core`. While it is a bit tricky to use, it was still a lot easier than anything I did with yarn. Basically I had to pass an object with information about the current manifest of the project and what dependencies should be changed as the first argument, and a `StoreController` and the lockfile as the second argument. Finding out how to optain the manifest and the `StoreController` took a bit, but I learned, that pnpm already has some convenient functions to create those from basic information ([`createOrConnectStoreController` from @pnpm/store-connection-manager](https://github.com/pnpm/pnpm/blob/main/packages/store-connection-manager/src/index.ts#L41) and [`readProjectManifest` from @pnpm/read-project-manifest](https://github.com/pnpm/pnpm/blob/main/packages/read-project-manifest/src/index.ts#L30)). You also need to sepecify `lockfileDir` in the second parameter of `mutateModules`. If you don't pnpm will look for a lockfile in a directory above yours and use that.

# Related projects

- [npm-install-package](https://github.com/yoshuawuyts/npm-install-package): Install packages from javascript. Spawns a npm process.
- [install-package](https://github.com/1000ch/install-package): Install packages from javascript. Spawns a npm process. Has a great name.
- [yarn-programmatic](https://github.com/tristanMatthias/yarn-programmatic): Use basic yarn functions from javascript. Spawns yarn.
- [pnpm-install](https://www.npmjs.com/package/pnpm-install): Does basically the same thing as this package. Uses a different pnpm API, maybe produces output, I haven't tested it yet. The npm package has no keywords, description or linked gitrepo, so I did not find this until after creating this package.
- [yarn-install](https://github.com/egoist/yarn-install): Install packages from javascript. Spawns a yarn or npm process.
