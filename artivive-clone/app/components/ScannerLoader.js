"use client";

import dynamic from "next/dynamic";

// Scanner uses browser-only camera APIs, so it must never run during
// server-side rendering. ssr: false guarantees that. This wrapper must be
// a Client Component itself — Next.js 16 no longer allows ssr:false to be
// called directly from a Server Component page.
const Scanner = dynamic(() => import("./Scanner"), {
  ssr: false,
});

export default function ScannerLoader() {
  return <Scanner />;
}
