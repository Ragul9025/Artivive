export const metadata = {
  title: "Scan to Watch",
  description: "Point your camera at the photo to play the video",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // prevents iOS from letting the user pinch-zoom the camera view, which
  // looks broken during AR tracking
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#000" }}>
        {children}
      </body>
    </html>
  );
}
