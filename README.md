# @tasoskakour/react-use-oauth2

> A custom React hook that makes OAuth2 authorization simple.

## Features

- Usage with both `Implicit` and `Authorization Code` grant methods.
- Seamlessly exchanges code for token via your backend API URL, for authorization code grant method.
- Works with Popup authorization.
- Provides data and loading/error states via a hook.
- Persists data to localStorage and automatically syncs auth state between tabs and/or browser windows.

## Install

_Requires `react@16.8.0` or higher that includes hooks._

```console
yarn add @tasoskakour/react-use-oauth2
```

or

```console
npm i @tasoskakour/use-persisted-reducer
```

## Usage example

```js
import { OAuth2Popup, useOAuth2 } from "@tasoskakour/react-use-oauth2";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = () => {
  const { data, loading, error, getAuth } = useOauth2({
    authorizeUrl: "https://example.com/auth",
    clientId: "YOUR_CLIENT_ID",
    redirectUri: `${document.location.origin}/callback`,
    scope: "YOUR_SCOPES",
    responseType: "code",
    exchangeCodeForTokenServerURL: "https://your-backend/token",
    exchangeCodeForTokenMethod: "POST",
    onSuccess: (payload) => console.log("Success", payload),
    onError: (error_) => console.log("Error", error_)
  });

  const isLoggedIn = Boolean(data?.access_token); // or whatever...

  if (error) {
    return <div>Error</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isLoggedIn) {
    return <pre>{JSON.stringify(data)}</pre>;
  }

  return (
    <button style={{ margin: "24px" }} type="button" onClick={() => getAuth()}>
      Login
    </button>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthPopup />} path="/callback" />
        <Route element={<Home />} path="/" />
      </Routes>
    </BrowserRouter>
  );
};
```

#### How exchangeCodeForTokenServerURL works

## API

**function useOAuth2(options): {data, loading, error, getAuth}**

`options` is an object that can contain the properties below:

- `authorizeUrl` (string): The 3rd party authorization URL (e.g https://accounts.google.com/o/oauth2/v2/auth)
- `clientId` (string): The OAuth2 client id of your application.
- `redirectUri` (string): Determines where the 3rd party API server redirects the user after the user completes the authorization flow.
- `scope` (string - _optional_): A list of scopes depending on your application needs.
- `responseType` (string): Can be either **code** for _code authorization grant_ or **token** for _implicit grant_ .
- `exchangeCodeForTokenServerURL` (string): This property is only required when using _code authorization grant_ method (responseType = code). It specifies the API URL of your server that will get called immediately after the user completes the authorization flow.
- `exchangeCodeForTokenMethod` (string): Specifies the HTTP method that will be used for the code-for-token exchange to your server. Defaults to **POST**.
- `onSuccess` (function): Called after a complete successful authorization flow.
- `onError` (function): Called when an error occurs.

Returns:

- `data`
- `loading`
- `error`
- `getAuth`
