"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Paths to your three trained assets (see /public/target/README inside the
// project, or the setup guide, for how to generate the .mind file).
// Swap these three lines for your own files later — everything else in this
// file stays the same.
const TARGET_MIND_FILE = "/target/target.mind";
const VIDEO_SRC = "/target/video.mp4";

export default function Scanner() {
  const containerRef = useRef(null);
  const mindarThreeRef = useRef(null);
  const videoElRef = useRef(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | scanning | found | playing | error
  const [errorMsg, setErrorMsg] = useState("");

  // Start MindAR once the SDK script has loaded and the DOM container exists
  useEffect(() => {
    if (!sdkReady) return;

    let stopped = false;

    async function start() {
      try {
        // MindARThree is attached to window by the script tag below
        const { MindARThree } = window.MINDAR.IMAGE;

        const mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: TARGET_MIND_FILE,
          // keep the AR scene plain — we don't need a 3D overlay,
          // we just want to know WHEN the target is found
          uiScanning: "no", // we draw our own scanning UI
          uiLoading: "no",
        });
        mindarThreeRef.current = mindarThree;

        const { renderer, scene, camera } = mindarThree;
        const anchor = mindarThree.addAnchor(0);

        anchor.onTargetFound = () => {
          if (stopped) return;
          setStatus("found");
          // small delay so the "found" flash is visible before video takes over
          setTimeout(() => {
            if (!stopped) setStatus("playing");
          }, 350);
        };

        anchor.onTargetLost = () => {
          if (stopped) return;
          // only fall back to scanning if we're not already playing the video
          setStatus((current) => (current === "playing" ? current : "scanning"));
        };

        await mindarThree.start();
        setStatus("scanning");

        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      } catch (err) {
        console.error(err);
        setStatus("error");
        setErrorMsg(
          err?.message?.includes("Permission")
            ? "Camera permission was denied. Please allow camera access and reload."
            : "Could not start the camera. Make sure you're on HTTPS and using a real device."
        );
      }
    }

    start();

    return () => {
      stopped = true;
      const mindarThree = mindarThreeRef.current;
      if (mindarThree) {
        try {
          mindarThree.renderer.setAnimationLoop(null);
          mindarThree.stop();
          // release the camera stream
          mindarThree.video?.srcObject
            ?.getTracks()
            .forEach((t) => t.stop());
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [sdkReady]);

  // Play the video full screen as soon as we enter "playing" status
  useEffect(() => {
    if (status === "playing" && videoElRef.current) {
      videoElRef.current.currentTime = 0;
      videoElRef.current.play().catch(() => {
        // autoplay can be blocked without a user gesture on some browsers;
        // the on-screen play button (rendered below) covers that case
      });
    }
  }, [status]);

  function handleScanAgain() {
    setStatus("scanning");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      {/* MindAR's own bundle - loaded once, globally, via script tag.
          This avoids bundler/WASM issues that come from importing the
          npm package directly into a Next.js client bundle. */}
      <Script
        src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      {/* Camera + AR canvas target. MindAR injects the <video> (camera feed)
          and <canvas> (AR overlay) into this div. */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          display: status === "playing" ? "none" : "block",
        }}
      />

      {status === "loading" && <Overlay text="Starting camera…" />}
      {status === "scanning" && (
        <Overlay text="Point your camera at the photo" subtle />
      )}
      {status === "found" && <Overlay text="Photo found!" flash />}
      {status === "error" && <Overlay text={errorMsg} isError />}

      {/* Full-screen video, shown only once the target photo is detected */}
      {status === "playing" && (
        <div style={{ position: "absolute", inset: 0, background: "#000" }}>
          <video
            ref={videoElRef}
            src={VIDEO_SRC}
            playsInline
            controls
            autoPlay
            onEnded={handleScanAgain}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000",
            }}
          />
          <button
            onClick={handleScanAgain}
            style={buttonStyle}
            aria-label="Scan again"
          >
            ✕ Scan again
          </button>
        </div>
      )}
    </div>
  );
}

function Overlay({ text, subtle, flash, isError }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 24px 64px",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <div
        style={{
          background: isError
            ? "rgba(150,20,20,0.85)"
            : flash
            ? "rgba(20,150,80,0.9)"
            : "rgba(0,0,0,0.55)",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: 999,
          fontSize: 15,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          opacity: subtle ? 0.85 : 1,
          maxWidth: 320,
        }}
      >
        {text}
      </div>
    </div>
  );
}

const buttonStyle = {
  position: "absolute",
  top: 16,
  right: 16,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  fontSize: 14,
  fontFamily: "system-ui, sans-serif",
};
