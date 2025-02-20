# Development

The pixelfed mobile app is written in [react native](https://reactnative.dev) and builds on the [expo framework](https://expo.dev).

## Requirements

- [`git-lfs`](https://git-lfs.com)
- [watchman](https://facebook.github.io/watchman/docs/install)
- Building for android:
    - [android studio](https://developer.android.com/studio) and java
- Building for iOS:
    - [xcode](https://developer.apple.com/xcode/)

https://docs.expo.dev/get-started/set-up-your-environment/ helps you to install most of the dependencies except for `git-lfs`.

## First time setup

```sh
npm i              # install dependencies
```

Also follow steps in https://docs.expo.dev/get-started/set-up-your-environment/

## Build the project

```sh
npm run start
```

### Web

```sh
npm run web
```

### Android

```sh
npm run android
```

### iOS

```sh
npm run ios
```

#### Select your real device to test on
```sh
npm run ios -- --device
```

### check for ts errors and lint problems
```sh
npm run check
```

### fix formatting & linting
```sh
npm run lint
```

## Troubleshooting

These are common errors you might encounter when building this project.

When debugging Android issues it is helpful to run `./gradlew assembleDebug`
within the `android/` directory. `npm` will not always show the full Android
build error otherwise.

### node not found
If iOS build complains about not being able to find `node`, but you can use node just fine, then run:
```
echo export NODE_BINARY=$(command -v node) > ios/.xcode.env.local
```

### iOS: Missing .mm file in pods
when you get an error like this one:
```
error: Build input file cannot be found: '/Users/me/Coding/pixelfed/pixelfed-rn/node_modules/react-native/React/Fabric/RCTThirdPartyFabricComponentsProvider.mm'. Did you forget to declare this file as an output of a script phase or custom build rule which produces it? (in target 'React-RCTFabric' from project 'Pods')
```
then you might be able to fix it by:
```sh
cd ios
pod install
```


### iOS: "Building workspace pixelfed with scheme pixelfed and configuration Debug"

When you are not part of the pixelfed apple developer team, then you need to make the following changes to get it to build:

- open `ios/pixelfed.xcworkspace` in xcode
- then in file explorer open "Pixelfed"
- go to target pixelfed
- go to Signing & capabilities
   - Change the team to your own
   - change bundle identifier by preprending your own domain in reverse notation
   - disable/remove app group
   - delete push notification capability

### iOS: "CommandError: ApplicationVerificationFailed"

Build it with xcode. It shows the full error.

### Android: "Error: Could not find or load main class org.gradle.wrapper.GradleWrapperMain"


Try removing the folder containing this repository and clone it again.

Build it with xcode. It shows the full error.


### Android: BUG! exception in phase 'semantic analysis' in source unit '_BuildScript_' Unsupported class file major version 67

This might mean that your java version is too new for the project. It is recommended to use Java 17.

### On macOS you can try this

`export JAVA_HOME=$(/usr/libexec/java_home -v 17)` after installing with homebrew and running

```
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Android: File google-services.json is missing

```
> Task :app:processDebugGoogleServices FAILED

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:processDebugGoogleServices'.
> File google-services.json is missing. The Google Services Plugin cannot function without it. 
   Searched Location: 
```

This means firebase config is missing. you need to create a firebase project and put the google-services.json into the Repository’s root directory. Then run `npx expo prebuild --platform android`

