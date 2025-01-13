# Development

The pixelfed mobile app is written in [react native](https://reactnative.dev) and builds on the [expo framework](https://expo.dev).

## Requirements

- [`git-lfs`](https://git-lfs.com)
- [`yarn` package manager](https://yarnpkg.com)
- [watchman](https://facebook.github.io/watchman/docs/install)
- Building for android:
    - [android studio](https://developer.android.com/studio) and java
- Building for iOS:
    - [xcode](https://developer.apple.com/xcode/)

https://docs.expo.dev/get-started/set-up-your-environment/ helps you to install most of the dependencies except for `git-lfs`.

## First time setup

```sh
corepack enable   # prerequisite to install yarn automatically on next step
yarn              # install dependencies
```

Also follow steps in https://docs.expo.dev/get-started/set-up-your-environment/

## Build the project

```sh
yarn start
```

### Web

```sh
yarn web
```

### Android

```sh
yarn android
```

### iOS

```sh
yarn ios
```

