## Akroma React Native

This package is used to communicate with the Akroma network. It started as a fork of https://github.com/cawfree/web3-react-native
The main Javascript was rewrote as Typescript and much of the Android module was updated. The Swift code has not yet been updated or tested.


## Development

```bash
  yarn build
  yalc push
```
## 🚀 Getting Started

Using [`npm`]():

```bash
npm install --save akroma-react-native
```

Using [`yarn`]():

```bash
yarn add akroma-react-native
```
### Install Locally
Using [`npm`]():

```bash
npm install /akroma-react-native
npx react-native link akroma-react-native
```

Using [`yarn`]():

```bash
yarn add file:/akroma-react-native
npx react-native link akroma-react-native
```

### iOS
After installing, append the following lines to your app's `ios/Podfile`, then execute `pod install`:

```
# web3-react-native
pod 'secp256k1.c', '0.1.2', :modular_headers => true
pod 'web3swift', '2.2.1', :modular_headers => true
```

> ⚠️ This is an ugly workaround for existing definition constraints in the  [Podspec](https://github.com/cawfree/web3-react-native/blob/63664f366c436aed73083b6b0a5cbf0b7374bfd3/web3-react-native.podspec#L26). ([View Issue](https://github.com/cawfree/web3-react-native/issues/1)).

### Android
In your app's `AndroidManifest.xml`, [you need to](https://github.com/web3j/web3j/issues/915) enable [`android:largeHeap`](https://developer.android.com/guide/topics/manifest/application-element) under the `<application>` tag:

```diff
  <application
+   android:largeHeap="true"
  />
```

Perform a rebuild of your compiled application by calling `react-native run-android`.