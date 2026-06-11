import './globals.css'

export const metadata = {
  title: 'Tiba — Your Pocket Stylist',
  description: 'Snap. Style. Go. Upload your outfit and get 3 real ways to wear it.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
