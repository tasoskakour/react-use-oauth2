# @tasoskakour/react-use-oauth2

![gh workflow](https://img.shields.io/github/actions/workflow/status/tasoskakour/react-use-oauth2/ci-cd.yml?branch=master) [![npm](https://img.shields.io/npm/v/@tasoskakour/react-use-oauth2.svg?style=svg&logo=npm&label=)](https://www.npmjs.com/package/@tasoskakour/react-use-oauth2)

> 💎 A custom React hook that makes OAuth2 authorization simple. Both for **Implicit Grant** and **Authorization Code** flows.

## Features

- Usage with both `Implicit` and `Authorization Code` grant flows.
- Seamlessly **exchanges code for token** via your backend API URL, for authorization code grant flows.
- Works with **Popup** authorization.
- Provides data and loading/error states via a hook.
- **Persists data** to localStorage and automatically syncs auth state between tabs and/or browser windows.

## Install

_Requires `react@16.8.0` or higher that includes hooks._

```console
yarn add @tasoskakour/react-use-oauth2
```

or

```console
npm i @tasoskakour/react-use-oauth2
```

## Usage example

*For authorization code flow:*

```js
import { OAuth2Popup, useOAuth2 } from "@tasoskakour/react-use-oauth2";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = () => {
  const { data, loading, error, getAuth, logout } = useOAuth2({
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
    return (
      <div>
        <pre>{JSON.stringify(data)}</pre>
        <button onClick={logout}>Logout</button>
      </div>
    )
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
        <Route element={<OAuthPopup />} path="/callback" />
        <Route element={<Home />} path="/" />
      </Routes>
    </BrowserRouter>
  );
};
```

### What is the purpose of `exchangeCodeForTokenServerURL` for Authorization Code flows?

Generally when we're working with authorization code flows, we need to *immediately* **exchange** the retrieved *code* with an actual *access token*, after a successful authorization. Most of the times this is needed for back-end apps, but there are many use cases this is useful for front-end apps as well. 

In order for the flow to be accomplished, the 3rd party provider we're authorizing against (e.g Google, Facebook etc), will provide an API call (e.g for Google is `https://oauth2.googleapis.com/token`) that we need to hit in order to exchange the code for an access token. However, this call requires the `client_secret` of your 3rd party app as a parameter to work - a secret that you cannot expose to your front-end app. 

That's why you need to proxy this call to your back-end and `exchangeCodeForTokenServerURL` is the API URL of your back-end route that will take care of this. The request parameters that will get passed along as **query parameters** are `{ code, client_id, grant_type, redirect_uri, state }`. By default this will be a **POST** request but you can change it with the `exchangeCodeForTokenMethod` property. 


You can read more about "Exchanging authorization code for refresh and access tokens" in [Google OAuth2 documentation](https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code).

### What's the case with Implicit Grant flows?

With an implicit grant flow things are much simpler as the 3rd-party provider immediately returns the `access_token` to the callback request so there's no need to make any action after that. Just set `responseType=token` to use this flow.

### Data persistence

After a successful authorization, data will get persisted to **localStorage** and the state will automatically sync to all tabs/pages of the browser. The storage key the data will be written to will be: `{responseType}-{authorizeUrl}-{clientId}-{scope}`. 

If you want to re-trigger the authorization flow just call `getAuth()` function again.

**Note**: In case localStorage is throwing an error (e.g user has disabled it) then you can use the `isPersistent` property which - for this case -will be false. Useful if you want to notify the user that the data is only stored in-memory.

## API

- `function useOAuth2(options): {data, loading, error, getAuth}`

This is the hook that makes this package to work. `Options` is an object that contains the properties below

- **authorizeUrl** (string): The 3rd party authorization URL (e.g https://accounts.google.com/o/oauth2/v2/auth).
- **clientId** (string): The OAuth2 client id of your application.
- **redirectUri** (string): Determines where the 3rd party API server redirects the user after the user completes the authorization flow. In our [example](#usage-example) the Popup is rendered on that redirectUri.
- **scope** (string - _optional_): A list of scopes depending on your application needs.
- **responseType** (string): Can be either **code** for _code authorization grant_ or **token** for _implicit grant_.
- **extraQueryParameters** (string - _optional_): An object of extra parameters that you'd like to pass to the query part of the authorizeUrl, e.g {audience: "xyz"}.
- **exchangeCodeForTokenServerURL** (string): This property is only used when using _code authorization grant_ flow (responseType = code). It specifies the API URL of your server that will get called immediately after the user completes the authorization flow. Read more [here](#what-is-the-purpose-of-exchangecodefortokenserverurl-for-authorization-code-flows).
- **exchangeCodeForTokenMethod** (string - _optional_): Specifies the HTTP method that will be used for the code-for-token exchange to your server. Defaults to **POST**.
- **exchangeCodeForTokenHeaders** (string - _optional_): An object of extra parameters that will be used for the code-for-token exchange to your server.
- **onSuccess** (function): Called after a complete successful authorization flow.
- **onError** (function): Called when an error occurs.

**Returns**:

- **data** (object): Consists of the retrieved auth data and generally will have the shape of `{access_token, token_type, expires_in}` (check [Typescript](#typescript) usage for providing custom shape).
- **loading** (boolean): Is set to true while the authorization is taking place.
- **error** (string): Is set when an error occurs.
- **getAuth** (function): Call this function to trigger the authorization flow.
- **logout** (function): Call this function to logout and clear all authorization data.
- **isPersistent** (boolean): Property that returns false if localStorage is throwing an error and the data is stored only in-memory. Useful if you want to notify the user.

---

- `function OAuthPopup(props)`

This is the component that will be rendered as a window Popup for as long as the authorization is taking place. You need to render this in a place where it does not disrupt the user flow. An ideal place is inside a `Route` component of `react-router-dom` as seen in the [usage example](#usage-example). 

Props consists of: 

- **Component** (ReactElement - _optional_): You can optionally set a custom component to be rendered inside the Popup. By default it just displays a "Loading..." message.

### Typescript

The `useOAuth2` function identity is:

```
const useOAuth2: <TData = AuthTokenPayload>(props: Oauth2Props<TData>) => {
    data: State<AuthTokenPayload>;
    loading: boolean;
    error: null;
    getAuth: () => () => void;
}
```

That means that generally the data will have the shape of `AuthTokenPayload` which consists of: 

```
token_type: string;
expires_in: number;
access_token: string;
scope: string;
refresh_token: string;
```

And that also means that you can set the data type by using the hook like this: 

```
type MyCustomShapeData = {
  ...
}

const {data, ...} = useOAuth2<MyCustomShapeData>({...});
```

### Tests

You can run tests by calling

```console
npm test
```

It will start a react-app (:3000) and  back-end server (:3001) and then it will run the tests with jest & puppeteer. 