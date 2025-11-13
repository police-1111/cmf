// server.js
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================================
// ☁️ Cloudinary Config (Global)
// =======================================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// =======================================
// 🔐 Session + Passport Setup
// =======================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set true if HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Only allowed Google accounts
const ALLOWED_EMAILS = ["hiiyogita11@gmail.com", "policeofficers100@gmail.com"];

// =======================================
// 🔑 Google OAuth Setup
// =======================================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://confession-mauve-nu.vercel.app/auth/google/callback"
          : "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (ALLOWED_EMAILS.includes(email)) {
        console.log("✅ Authorized:", email);
        return done(null, profile);
      } else {
        console.log("🚫 Unauthorized attempt:", email);
        return done(null, false, { message: "Unauthorized user" });
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// =======================================
// 🧭 Auth Middleware
// =======================================
function ensureAuth(req, res, next) {
  if (req.isAuthenticated() && ALLOWED_EMAILS.includes(req.user.emails[0].value)) {
    return next();
  }
  res.redirect("/denied.html");
}

// =======================================
// 🧭 Google OAuth Routes
// =======================================
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/denied.html" }),
  (req, res) => {
    if (req.user && ALLOWED_EMAILS.includes(req.user.emails[0].value)) {
      console.log("✅ Login success:", req.user.emails[0].value);
      res.redirect("/indax.html");
    } else {
      console.log("🚫 Login blocked");
      req.logout(() => res.redirect("/denied.html"));
    }
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// =======================================
// 🌐 Static Files
// =======================================
app.use(express.static(path.join(__dirname, "public")));

// =======================================
// 🎧 /api/songs Endpoint (Merged)
// =======================================
app.get("/api/songs", async (req, res) => {
  console.log("🎧 GET /api/songs request received");

  try {
    const result = await cloudinary.search
      .expression("(folder:song AND (resource_type:raw OR resource_type:video))")
      .sort_by("created_at", "desc")
      .max_results(50)
      .execute();

    const songs = result.resources.map((r) => ({
      url: r.secure_url,
      name: r.public_id.split("/").pop(),
    }));

    console.log(`✅ Found ${songs.length} songs`);
    res.status(200).json({ songs });
  } catch (err) {
    console.error("❌ Error fetching songs:", err);
    res.status(500).json({ error: "Failed to fetch songs", details: err.message });
  }
});

// =======================================
// 📸 /api/vault Endpoint (Merged)
// =======================================
app.get("/api/vault", async (req, res) => {
  console.log("📸 GET /api/vault request received");
  try {
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
    res.status(500).json({ error: "Failed to fetch from Cloudinary", details: err.message });
  }
});

// =======================================
// 🏠 Page Routes
// =======================================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "home.html")));
app.get("/indax.html", ensureAuth, (req, res) =>
  res.sendFile(path.join(__dirname, "public", "indax.html"))
);
app.get("/denied.html", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "denied.html"))
);

// =======================================
// 🚀 Start Server (Local Only)
// =======================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// ✅ Export for Vercel
export default app;
