"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
     
      rememberLastUsedCamera: true, 
    });

    scanner.render(onScanSuccess, (err) => {
      
    });

    return () => {
      scanner.clear().catch((e) => console.error("Scanner clear failed", e));
    };
  }, [onScanSuccess]);

  return <div id="reader" className="rounded-xl overflow-hidden"></div>;
}
