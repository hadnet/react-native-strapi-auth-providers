import React, { useRef } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import axios, { AxiosError } from 'axios';

export type Payload = {
  jwt: string;
  user: {
    id: number;
    email: string;
    username: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    provider?: Providers;
  };
};

export type ErrorPayload = {
  data: null;
  error: {
    message: string;
    status: number;
    name: string;
    details: { [k: string]: string };
  };
};

export type Providers =
  | 'instagram'
  | 'facebook'
  | 'google'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'cognito'
  | 'discord'
  | 'twitch'
  | 'reddit'
  | 'vk'
  | 'auth0'
  | 'cas';

export type Languages =
  | 'en'
  | 'ar'
  | 'fr'
  | 'cs'
  | 'de'
  | 'dk'
  | 'es'
  | 'he'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'ms'
  | 'nl'
  | 'no'
  | 'pl'
  | 'pt-BR'
  | 'pt'
  | 'ru'
  | 'sk'
  | 'sv'
  | 'th'
  | 'tr'
  | 'uk'
  | 'vi'
  | 'zh-Hans'
  | 'zh';

type CancelBtnColorProp =
  | `#${number}`
  | `rgba(${number}, ${number}, ${number}, ${number})`;

type Props = {
  lang?: Languages;
  incognito?: boolean;
  provider: Providers;
  redirectUrl: string;
  backendUrl: string;
  isVisisble: boolean;
  onCancel: () => void;
  onSuccess: (payload: Payload) => void;
  onError: (error: string | AxiosError<ErrorPayload>) => void;
  cancelBtnText?: CancelBtnColorProp;
  cancelBtnTextColor?: CancelBtnColorProp;
  cancelBtnBgColor?: CancelBtnColorProp;
};

export const StrapiAuthLogin = ({
  isVisisble,
  incognito,
  lang,
  redirectUrl,
  backendUrl,
  provider,
  onCancel,
  onSuccess,
  onError,
  cancelBtnText,
  cancelBtnTextColor,
  cancelBtnBgColor,
}: Props) => {
  const webView = useRef<WebView>(null);

  const providerUrl = `${backendUrl}/api/connect/${provider}`;

  const patchPostMessageJsCode = `(${String(function () {
    // @ts-ignore
    var originalPostMessage = window.postMessage;
    var patchedPostMessage = function (
      message: any,
      targetOrigin: any,
      transfer: any
    ) {
      originalPostMessage(message, targetOrigin, transfer);
    };
    patchedPostMessage.toString = function () {
      return String(Object.hasOwnProperty).replace(
        'hasOwnProperty',
        'postMessage'
      );
    };
    // @ts-ignore
    window.postMessage = patchedPostMessage;
  })})();`;

  const onNavigationStateChange = async (event: WebViewNavigation) => {
    if (event.url.startsWith(redirectUrl)) {
      webView.current?.stopLoading();

      let regex = /[?&]([^=#]+)=([^&#]*)/g;

      const params = Object.fromEntries(
        [...event.url.matchAll(regex)].map((m) => [m[1], m[2]])
      );

      const { access_token } = params;
      if (access_token) {
        try {
          const response = await axios.get<Payload>(
            `${backendUrl}/api/auth/${provider}/callback`,
            {
              params: {
                access_token: `${access_token}`,
              },
            }
          );
          onSuccess(response.data);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response)
              onError(error.response.data as AxiosError<ErrorPayload>);
          } else {
            if (error instanceof Error) onError(error.message);
            else onError('Unknown error');
          }
        }
      } else onError('No access token found');
    }
  };

  return (
    <Modal visible={isVisisble} animationType="slide">
      <SafeAreaView style={{ height: '100%' }}>
        <TouchableOpacity
          style={{
            backgroundColor: cancelBtnBgColor ?? 'transparent',
            justifyContent: 'center',
            position: 'absolute',
            bottom: '2%',
            zIndex: 1,
            alignSelf: 'center',
            padding: 12,
            borderRadius: 10,
          }}
          onPress={onCancel}
        >
          <Text
            style={{
              textAlign: 'center',
              color: cancelBtnTextColor ?? 'rgba(180, 180, 180, 1.000)',
            }}
          >
            {cancelBtnText ?? 'Close'}
          </Text>
        </TouchableOpacity>
        <WebView
          userAgent={
            Platform.OS === 'android'
              ? 'Chrome/103.0.0.0 Mobile Safari/537.36'
              : 'AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/103.0.5060.63 Mobile/15E148 Safari/604.1'
          }
          ref={webView}
          source={{
            uri: providerUrl,
            headers: {
              'Accept-Language': lang ?? 'en',
            },
          }}
          incognito={incognito}
          startInLoadingState
          onError={(err: unknown) => console.log({ err })}
          onMessage={(msg: unknown) => console.log({ msg })}
          onNavigationStateChange={onNavigationStateChange}
          injectedJavaScript={patchPostMessageJsCode}
        />
      </SafeAreaView>
    </Modal>
  );
};
