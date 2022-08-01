import * as React from 'react';

import { StyleSheet, View, Text, Alert } from 'react-native';
import LoginWithAuthStrapi from 'react-native-strapi-auth-providers';

export default function App() {
  const [token, setToken] = React.useState<string>();
  const [open, setOpen] = React.useState(true);

  return (
    <View style={styles.container}>
      <LoginWithAuthStrapi
        isVisisble={open}
        provider="instagram"
        lang="pt-BR"
        backendUrl="https://api.staging.myfitnesscalc.com"
        redirectUrl="https://www.myfitnesscalc.com/redirect"
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
      <View>
        <Text>{token}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
