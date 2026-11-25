import { env } from "../config/env.js";
import { AppError } from "./responses.js";

export async function uploadBase64ToImgBB(base64Image: string): Promise<string> {
  if (!env.IMGBB_API_KEY) {
    throw new AppError("IMGBB_API_KEY is not configured on the server.", 500);
  }

  const formData = new FormData();
  formData.append("image", base64Image);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(env.IMGBB_API_KEY)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { display_url?: string };
    error?: { message?: string };
  } | null;

  if (!response.ok || !result?.success || !result?.data?.display_url) {
    throw new AppError(
      result?.error?.message || "Failed to upload image to ImgBB.",
      502
    );
  }

  return result.data.display_url;
}
