// src/features/news/utils/cropImage.ts
import type { PixelCrop } from "react-image-crop";

/**
 * Vẽ vùng crop (theo toạ độ hiển thị trên màn hình) lên canvas,
 * quy đổi về kích thước gốc (naturalWidth/naturalHeight) của ảnh,
 * rồi xuất ra File để upload lên server.
 */
export async function getCroppedImageFile(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string,
  mimeType: string = "image/jpeg",
  quality: number = 0.92,
): Promise<File> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scaleX));
  canvas.height = Math.max(1, Math.round(crop.height * scaleY));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Trình duyệt không hỗ trợ canvas để cắt ảnh.");
  }
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không thể tạo ảnh đã cắt."));
          return;
        }
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      quality,
    );
  });
}

/** Đọc kích thước thật (naturalWidth/naturalHeight) của 1 file ảnh */
export function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () =>
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          dataUrl,
        });
      img.onerror = () => reject(new Error("Không thể đọc ảnh."));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
}
