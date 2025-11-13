// /api/vault.js
import { v2 as cloudinary } from "cloudinary";

export default async function handler(req, res) {
  console.log("📸 GET /api/vault request received");

  // ✅ Configure Cloudinary (must be inside handler for Vercel)
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  try {
    // Fetch images, videos, and songs separately
    const [images, videos, songs] = await Promise.all([
      cloudinary.search
        .expression("folder:aif AND resource_type:image")
        .sort_by("created_at", "desc")
        .max_results(50)
        .execute(),
      cloudinary.search
        .expression("folder:aif AND resource_type:video")
        .sort_by("created_at", "desc")
        .max_results(30)
        .execute(),
      cloudinary.search
        .expression("folder:song AND resource_type:raw")
        .sort_by("created_at", "desc")
        .max_results(50)
        .execute(),
    ]);

    res.status(200).json({
      images: images.resources.map((r) => r.secure_url),
      videos: videos.resources.map((r) => r.secure_url),
      songs: songs.resources.map((r) => ({
        url: r.secure_url,
        name: r.public_id.split("/").pop(),
      })),
    });
  } catch (err) {
    console.error("❌ Cloudinary fetch failed:", err);
    res.status(500).json({
      error: "Failed to fetch from Cloudinary",
      details: err.message,
    });
  }
}