export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey || apiKey === "your-imgbb-api-key") {
    throw new Error(
      "ImgBB API key is not configured. Please set NEXT_PUBLIC_IMGBB_API_KEY in client/.env.local."
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, WebP, or GIF images are supported.");
  }

  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("Image size must be 5MB or smaller.");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success || !result?.data?.display_url) {
    throw new Error(
      result?.error?.message || "Failed to upload image to ImgBB."
    );
  }

  return result.data.display_url as string;
}
