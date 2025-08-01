import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
  const { status, data: session } = useSession({ required: true });

  console.log("Auth status:", status);
  console.log("Session data:", session);

  if (status === "loading") {
    return authData.loading || (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Redirect to="/auth/login" />;
  }

  if (authData.role === "admin" && !session.user.isAdmin) {
    console.log("Usuário não é admin, redirecionando...");
    return <Redirect to="/" />;
  }

  return children;
}

function Redirect({ to }) {
  const router = useRouter();

  useEffect(() => {
    if (to) {
      router.push(to);
    }
  }, [to, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh' 
    }}>
      <p>Redirecionando...</p>
    </div>
  );
}

export default MyApp;