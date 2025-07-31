import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { userIsAdmin } from '@/lib/auth';
import { useSession } from "next-auth/react"

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {Component.auth ? (
        <Auth authData={Component.auth}>
          <Component {...pageProps} />
        </Auth>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}

function Auth({ children, authData }) {
  const { status, data: session } = useSession({ required: true })

  console.log("Auth status:", status);

  if (status === "loading") {
    return authData.loading
  }

  if (authData.role === "admin" && !userIsAdmin(session.user)) {
    return <Redirect to="/auth/login" />;
  }

  return children
}

function Redirect({ to }) {
  const router = useRouter()

  useEffect(() => {
    router.push(to)
  }, [to, router])

  return null
}

export default MyApp;