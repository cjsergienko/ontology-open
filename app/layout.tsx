import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export const metadata: Metadata = {
  metadataBase: new URL('https://ontology.live'),
  title: 'ontology.live — Visual Ontology & Knowledge Graph Designer',
  description: 'Design ontologies, taxonomies, and knowledge graphs visually. The structural backbone for AI agent pipelines.',
  openGraph: {
    title: 'ontology.live — Visual Ontology & Knowledge Graph Designer',
    description: 'Design ontologies, taxonomies, and knowledge graphs visually. The structural backbone for AI agent pipelines.',
    url: 'https://ontology.live',
    siteName: 'ontology.live',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QN69YV0RFG" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-QN69YV0RFG');
        `}</Script>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
