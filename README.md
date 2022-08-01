# react-native-strapi-auth-providers

Use OAuth and OAuth2 providers through Strapi to enable authentication in your React Native application

## Installation

```sh
yarn add react-native-webview react-native-strapi-auth-providers@alpha
npx pod-install
```

## Usage

```tsx
import { StyleSheet, View, Text, Alert } from 'react-native';
import LoginWithAuthStrapi from 'react-native-strapi-auth-providers';

export default function App() {
  const [token, setToken] = useState<>();
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.container}>
      <LoginWithAuthStrapi
        isVisisble={open}
        provider="instagram"
        lang="pt-BR"
        backendUrl="https://api.mystrapiserver.com"
        redirectUrl="https://www.myredirectpage.com/redirect"
        onCancel={() => {
          setOpen(false);
        }}
        onSuccess={(token) => {
          Alert.alert(`success ${token?.jwt}`);
          setToken(token.jwt);
          setOpen(false);
        }}
        onError={(m) => {
          Alert.alert(`error ${m}`);
        }}
      />
    </View>
  );
}

// ...
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
