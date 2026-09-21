import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QrDisplayProps {
  token: string;
  plate: string;
  size?: number;
}

export const QrDisplay: React.FC<QrDisplayProps> = ({ token, plate, size = 180 }) => {
  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/portal/${token}`
    : `https://taller.com/portal/${token}`;

  return (
    <div className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-900 text-center">
      <div className="p-2 bg-white rounded-xl">
        <QRCodeCanvas value={portalUrl} size={size} level="H" includeMargin />
      </div>
      <div className="mt-3">
        <span className="font-mono font-bold text-sm tracking-wider uppercase bg-slate-100 px-3 py-1 rounded border border-slate-300">
          {plate}
        </span>
        <p className="text-[11px] text-slate-500 mt-2 font-medium">
          Escanea para ver la ficha en tiempo real
        </p>
      </div>
    </div>
  );
};
