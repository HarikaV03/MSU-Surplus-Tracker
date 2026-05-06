"use client";
import { useEffect } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QRScanner({ onScanSuccess }) {
  useEffect(() => {
    // Support both QR codes and common 1D barcodes so the scanner works with
    // camera-based barcode scanning as well as QR labels.
    const formatsToSupport = [
      Html5QrcodeSupportedFormats.QR_CODE,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.ITF,
      Html5QrcodeSupportedFormats.CODABAR,
    ];

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport,
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
