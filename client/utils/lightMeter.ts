import { AlphaType, ColorType, Skia } from "@shopify/react-native-skia";

/**
 * Estimates ambient illuminance (lux) from a camera photo.
 *
 * Pixel values alone can't measure room brightness: auto-exposure pushes every
 * scene toward mid-gray. The camera's exposure settings carry the real signal,
 * so we use the incident-light meter equation
 *
 *     E = C * N^2 / (t * ISO)        (C ≈ 250, N = f-number, t = seconds)
 *
 * which gives the illuminance the camera exposed for, then correct it by how far
 * the actual image landed from middle gray (18% linear luminance).
 *
 * Phone cameras aren't calibrated light meters, so treat this as an estimate
 * (roughly within 2x), but it scales correctly from a dark room to daylight.
 */

const INCIDENT_METER_CONSTANT = 250;
const MIDDLE_GRAY = 0.18;
const PIXEL_SAMPLE_TARGET = 4000;

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Mean linear luminance (0..1) of a base64-encoded JPEG/PNG, or null if it can't be decoded. */
export function meanLuminance(base64: string): number | null {
  const clean = base64.replace(/^data:image\/[a-z]+;base64,/, "");
  const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(clean));
  if (!image) return null;

  const width = image.width();
  const height = image.height();
  const pixels = image.readPixels(0, 0, {
    width,
    height,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!pixels || !(pixels instanceof Uint8Array)) return null;

  const pixelCount = width * height;
  const stride = Math.max(1, Math.floor(pixelCount / PIXEL_SAMPLE_TARGET));
  let sum = 0;
  let count = 0;
  for (let p = 0; p < pixelCount; p += stride) {
    const i = p * 4;
    sum +=
      0.2126 * srgbToLinear(pixels[i]) +
      0.7152 * srgbToLinear(pixels[i + 1]) +
      0.0722 * srgbToLinear(pixels[i + 2]);
    count++;
  }
  return count > 0 ? sum / count : null;
}

function firstNumber(value: unknown): number | null {
  const v = Array.isArray(value) ? value[0] : value;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && isFinite(n) && n > 0 ? n : null;
}

/** Returns estimated lux, or null if the photo lacks the exposure metadata needed. */
export function estimateLux(base64: string, exif: Record<string, unknown> | undefined): number | null {
  if (!exif) return null;

  const exposureTime = firstNumber(exif.ExposureTime);
  const fNumber = firstNumber(exif.FNumber) ?? firstNumber(exif.ApertureValue && Math.pow(2, Number(exif.ApertureValue) / 2));
  const iso = firstNumber(exif.ISOSpeedRatings) ?? firstNumber(exif.PhotographicSensitivity) ?? firstNumber(exif.ISO);
  if (!exposureTime || !fNumber || !iso) return null;

  const exposedFor = (INCIDENT_METER_CONSTANT * fNumber * fNumber) / (exposureTime * iso);

  // If the image came out brighter/darker than middle gray, scale accordingly.
  // Clamp so a nearly black or blown-out frame can't swing the result wildly.
  const lum = meanLuminance(base64);
  const correction = lum === null ? 1 : Math.min(4, Math.max(0.25, lum / MIDDLE_GRAY));

  return Math.round(exposedFor * correction);
}
