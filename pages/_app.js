import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Echo Music Player</title>
        <meta name="description" content="A modern music streaming app with Spotify integration and MP3 uploads" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
