# @tasoskakour/react-use-oauth2

![gh workflow](https://img.shields.io/github/actions/workflow/status/tasoskakour/react-use-oauth2/ci-cd.yml?branch=master) [![npm](https://img.shields.io/npm/v/@tasoskakour/react-use-oauth2.svg?style=svg&logo=npm&label=)](https://www.npmjs.com/package/@tasoskakour/react-use-oauth2)

> 💎 A custom React hook that makes OAuth2 authorization simple — supporting both **Authorization Code** and **Implicit Grant** flows.

---

## ✨ Features

- Supports **Authorization Code** and **Implicit Grant** flows.
- **Exchanges code for token** via your backend automatically (for Authorization Code flow).
- Handles **popup-based** authorization.
- Provides **data**, **loading**, and **error** states.
- **Persists auth state** to `localStorage` and **syncs across tabs**.

---

## 📦 Installation

_Requires `react@18` or higher._

```bash
npm install @tasoskakour/react-use-oauth2
# or
yarn add @tasoskakour/react-use-oauth2
```

---

## 🚀 Usage Example

**Authorization Code Flow Example:**

```tsx
import { OAuthPopup, useOAuth2 } from "@tasoskakour/react-use-oauth2";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = () => {
  const { data, loading, error, getAuth, logout } = useOAuth2({
    authorizeUrl: "https://example.com/auth",
    clientId: "YOUR_CLIENT_ID",
    redirectUri: `${document.location.origin}/callback`,
    scope: "YOUR_SCOPES",
    responseType: "code",
    exchangeCodeForTokenQuery: {
      url: "https://your-backend/token",
      method: "POST",
    },
    state: {
      foo: 'bar',
      customInfo: 'something',
    },
    onSuccess: (payload) => console.log("Success", payload),
    onError: (error_) => console.log("Error", error_),
  });

  const isLoggedIn = Boolean(data?.access_token); // or whatever...


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (isLoggedIn) return (
    <div>
      <pre>{JSON.stringify(data)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );

  return (
    <button onClick={getAuth}>Login</button>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/callback" element={<OAuthPopup />} />
    </Routes>
  </BrowserRouter>
);
```

---

## 📚 Concepts

### 🔹 What is `exchangeCodeForTokenQuery`?

When using the **Authorization Code** flow, after receiving an authorization `code`, you must **exchange** it for an **access token**.  
You typically do this **server-side** because it requires your OAuth client secret.

The `exchangeCodeForTokenQuery` object lets you specify:
- `url`: Your backend endpoint that performs the code-to-token exchange.
- `method`: HTTP method (default: `POST`).
- `headers`: Optional custom headers.

The backend must call the OAuth provider's token endpoint securely.

[More about exchanging authorization codes ➡️ (Google docs)](https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code)

---

### 🔹 Alternative: `exchangeCodeForTokenQueryFn`

If you need **full control** (e.g., sending `application/x-www-form-urlencoded` body),  
you can use `exchangeCodeForTokenQueryFn`, a custom async function that manually exchanges the code.

```tsx
const { getAuth } = useOAuth2({
  exchangeCodeForTokenQueryFn: async (callbackParameters) => {
    const formBody = Object.entries(callbackParameters)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&");

    const response = await fetch(`YOUR_BACKEND_URL`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formBody,
    });

    if (!response.ok) throw new Error('Failed to exchange code');
    return response.json();
  },
});
```

---

### 🔹 What about Implicit Grant flows?

In an **Implicit Grant** (`responseType: 'token'`), the 3rd-party provider sends back the `access_token` **directly** — no server exchange needed.

---

### 🔹 Passing custom state

You can also pass a **custom `state`** object into `useOAuth2`, which will:
- Be securely wrapped under a random key.
- Be sent during the authorization request.
- Be automatically extracted and sent back to your backend during token exchange.

Example:

```tsx
state: {
  visitedPage: '/checkout',
  customParam: 'something',
}
```

✅ Safely preserves context like `{ visitedPage: '/checkout', customInfo: 'xyz' }` across OAuth.

---

## 🧠 Data Persistence

- After login, auth data persists to `localStorage`.
- Auto-syncs across tabs/windows.
- The storage key format is:  
  ```
  {responseType}-{authorizeUrl}-{clientId}-{scope}
  ```
- If you want to re-trigger the authorization flow just call `getAuth()` function again.
- If localStorage is disabled (e.g. by browser settings), the hook falls back to in-memory storage and sets `isPersistent = false`.

---

## 🛠 API

```tsx
const {
  data,
  loading,
  error,
  getAuth,
  logout,
  isPersistent
} = useOAuth2(options);
```

**Options:**

| Option | Type | Description |
|:---|:---|:---|
| `authorizeUrl` | string | OAuth provider authorization URL  (e.g https://accounts.google.com/o/oauth2/v2/auth) |
| `clientId` | string | Your app's client ID |
| `redirectUri` | string | Callback URL after authorization |
| `scope` | string _(optional)_ | Space-separated OAuth scopes |
| `responseType` | `'code' \| 'token'` | Authorization Code or Implicit Grant flow |
| `state` | `Record<string, any> \| null \| undefined` | Custom state object (optional) |
| `extraQueryParameters` | object _(optional)_ | An object of extra parameters that you'd like to pass to the query part of the authorizeUrl, e.g {audience: "xyz"} |
| `exchangeCodeForTokenQuery` | object | This property is only required when using code authorization grant flow (responseType = code). Its properties are listed below |
| `exchangeCodeForTokenQuery.url` | string _(required)_ | It specifies the API URL of your server that will get called immediately after the user completes the authorization flow. Read more [here](#-concepts) |
| `exchangeCodeForTokenQuery.method` | string _(required)_ | Specifies the HTTP method that will be used for the code-for-token exchange to your server. Defaults to **POST** |
| `exchangeCodeForTokenQuery.headers` | object _(optional)_ | An object of extra parameters that will be used for the code-for-token exchange to your server. |
| `exchangeCodeForTokenQueryFn` | `function(callbackParameters) => Promise<Object>` _(optional)_ | **Instead of using** `exchangeCodeForTokenQuery` to describe the query, you can take full control and provide query function yourself. `callbackParameters` will contain everything returned from the OAUth2 callback e.g `code, state` etc. You must return a promise with a valid object that will represent your final state - data of the auth procedure. |
| `onSuccess` | function | Called after a complete successful authorization flow. |
| `onError` | function | Called when an error occurs. |

**Returned fields:**

- `data` (object): Consists of the retrieved auth data and generally will have the shape of `{access_token, token_type, expires_in}` (check [Typescript](#-typescript-support) usage for providing custom shape). If you're using `responseType: code` and `exchangeCodeForTokenQueryFn` this object will contain whatever you return from your query function.
- `loading` (boolean): Is set to true while the authorization is taking place.
- `error` (string): Is set when an error occurs.
- `getAuth` (function): Call this function to trigger the authorization flow.
- `logout` (function): Call this function to logout and clear all authorization data.
- `isPersistent` (boolean): Property that returns false if localStorage is throwing an error and the data is stored only in-memory. Useful if you want to notify the user.

---

- `function OAuthPopup(props)`

This is the component that will be rendered as a window Popup for as long as the authorization is taking place. You need to render this in a place where it does not disrupt the user flow. An ideal place is inside a `Route` component of `react-router-dom` as seen in the [usage example](#-usage-example). 

Props consists of: 

- `Component` (ReactElement - _optional_): You can optionally set a custom component to be rendered inside the Popup. By default it just displays a "Loading..." message.

---

## 📜 TypeScript Support

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

---

### 🧪 Running Tests

```bash
npm test
```

- Spins up a React app (`localhost:3000`) and a mock server (`localhost:3001`).
- Runs E2E tests using Jest + Puppeteer.
- Covers popup opening, redirection, token exchange, custom state handling, logout flow.

