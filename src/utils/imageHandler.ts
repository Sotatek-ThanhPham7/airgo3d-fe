import { RcFile } from "antd/es/upload";

// Common helper: generate a JPEG thumbnail blob (~400px wide by default)
export const generateThumbnailBlob = (
  sourceFile: RcFile,
  maxWidth = 400,
  quality = 0.7
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Failed to read image for thumbnail."));

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = img.width * scale;
        const height = img.height * scale;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to generate thumbnail blob."));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () =>
        reject(new Error("Failed to load image for thumbnail."));

      img.src = reader.result as string;
    };

    reader.readAsDataURL(sourceFile);
  });
};
