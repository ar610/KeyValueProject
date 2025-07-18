// Install QR scanner library
// npm install qr-scanner

// components/QRScanner.js
import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScan, onError }) => {
  const videoRef = useRef(null);
  const [qrScanner, setQrScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          setIsScanning(false);
          onScan(result.data);
        },
        {
          onDecodeError: (error) => {
            console.log('QR decode error:', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      setQrScanner(scanner);

      return () => {
        scanner.destroy();
      };
    }
  }, [onScan]);

  const startScanning = async () => {
    if (qrScanner) {
      try {
        setIsScanning(true);
        await qrScanner.start();
      } catch (error) {
        setIsScanning(false);
        onError(error);
      }
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      setIsScanning(false);
    }
  };

  return (
    <div className="qr-scanner-container">
      <video
        ref={videoRef}
        className="w-full h-64 bg-black rounded-lg"
        style={{ display: isScanning ? 'block' : 'none' }}
      />
      
      {!isScanning && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-gray-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.5 6.5v3h-3v-3h3zM11 5H5v6h6V5zM9.5 14.5v3h-3v-3h3zM11 13H5v6h6v-6zM17.5 6.5v3h-3v-3h3zM19 5h-6v6h6V5zM13 13h1.5v1.5H13V13zM14.5 14.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zM13 16h1.5v1.5H13V16zM14.5 17.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zM17.5 14.5H19V16h-1.5v-1.5zM17.5 17.5H19V19h-1.5v-1.5zM19 13h1.5v1.5H19V13z"/>
            </svg>
            <p>Click to start QR code scanning</p>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;