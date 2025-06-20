import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/client-provider'
import { ThemeProvider } from '@/components/theme-provider'
import Footer from '@/components/Footer'
import QuizShowcase from '@/components/Showcase'
import FAQ from '@/components/FAQ'
import Navbar from '@/components/Navbar'
import VideoShowcase from '@/components/VideoShowcase'

const poppins = Poppins({
  subsets: ['latin'],
  weight: "500"
})

export const metadata: Metadata = {
  title: 'PDF2Quiz',
  description: 'Quiz generator made by T8 Enterprises',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>

              <>
                <Navbar />
                {children}
                <QuizShowcase />
                <VideoShowcase />
                <FAQ />
                <Footer />
              </>

            </ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}