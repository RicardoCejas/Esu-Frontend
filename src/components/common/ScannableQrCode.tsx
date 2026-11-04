import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, Loader2 } from 'lucide-react';

interface ScannableQrCodeProps {
  value: string;
  size?: number;
  className?: string;
  alt?: string;
}

export const ScannableQrCode: React.FC<ScannableQrCodeProps> = ({
  value,
  size = 120,
  className = '',
  alt = 'Código QR escaneable',
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 200),
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error generando QR code:', err);
        if (isMounted) {
          setDataUrl(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-50 text-slate-400 ${className}`}
        style={{ width: size, height: size }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-50 text-slate-400 ${className}`}
        style={{ width: size, height: size }}
      >
        <QrIcon className="h-4/5 w-4/5 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
    />
  );
};
