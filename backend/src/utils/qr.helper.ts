import QRCode from 'qrcode';
import { env } from '../config/env';

/**
 * Retorna la URL del portal público para el vehículo
 */
export const getPublicVehiclePortalUrl = (vehicleToken: string): string => {
  return `${env.FRONTEND_URL}/portal/${vehicleToken}`;
};

/**
 * Genera el QR Code en formato Data URL (base64) a partir del vehicleToken
 */
export const generateQRCodeDataUrl = async (vehicleToken: string): Promise<string> => {
  const portalUrl = getPublicVehiclePortalUrl(vehicleToken);
  return QRCode.toDataURL(portalUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });
};
