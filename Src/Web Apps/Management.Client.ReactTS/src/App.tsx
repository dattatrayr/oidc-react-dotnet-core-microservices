//https://authts.github.io/oidc-client-ts/modules.html
import { User } from "oidc-client-ts";
import * as React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
  BrowserRouter,
} from "react-router-dom";

import AuthCallback from "./containers/AuthCallback";
import SignoutCallback from "./containers/SignoutCallback";
import AuthService from "./services/AuthService";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin-oidc" element={<AuthCallback />} />
          <Route path="/signout-callback-oidc" element={<SignoutCallback />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}></Route>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <ProtectedPage />
              </RequireAuth>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function Layout() {
  return (
    <div>
      <AuthStatus></AuthStatus>
      <ul>
        <li>
          <Link to="/protected">Protected Page</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (auth == undefined) {
    return null; // or loading spinner, etc...
  }

  console.log(auth.user);
  // Redirect them to the /login page, but save the current location they were
  // trying to go to when they were redirected. This allows us to send them
  // along to that page after they login, which is a nicer user experience
  // than dropping them off on the home page.
  return auth.user ? children : <Navigate to="/login" replace />;
}

interface AuthContextType {
  user: any;
  signin: () => void;
  signout: () => void;
  loginCallback: () => Promise<User>;
}

let AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null | undefined>();

  // React.useEffect(() => {
  //   localStorage.setItem("user", JSON.stringify(user));
  // }, [user]);

  const authService = new AuthService();

  const signin = () => authService.login();

  const loginCallback = async (): Promise<User> => {
    const authedUser = await authService.loginCallback();
    setUser(authedUser);
    return authedUser;
  };

  const signout = () => authService.login().then(() => setUser(null));
  const value = { user, signin, signout, loginCallback };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, useAuth };

function useAuth() {
  return React.useContext(AuthContext);
}

function AuthStatus() {
  let auth = useAuth();
  let navigate = useNavigate();

  console.log(auth.user);
  if (!auth.user) {
    return <p>You are not logged in.</p>;
  }

  return (
    <p>
      Welcome
      <button
        onClick={() => {
          auth.signout();
        }}
      >
        Sign out
      </button>
    </p>
  );
}

function LoginPage() {
  let navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  let from = location.pathname || "/";

  console.log("before signin");
  auth.signin();
  console.log("after signin");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let formData = new FormData(event.currentTarget);
    let username = formData.get("username") as string;

    auth.signin();
    // auth.signin(username, () => {
    //   // Send them back to the page they tried to visit when they were
    //   // redirected to the login page. Use { replace: true } so we don't create
    //   // another entry in the history stack for the login page.  This means that
    //   // when they get to the protected page and click the back button, they
    //   // won't end up back on the login page, which is also really nice for the
    //   // user experience.
    //   navigate(from, { replace: true });
    // });
  }

  return (
    <div>
      <p>You must log in to view the page at {from}</p>
    </div>
  );
}

function PublicPage() {
  return <h3>Public</h3>;
}

function ProtectedPage() {
  return <h3>Protected</h3>;
}
