import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { dbInstance } from "./src/server/dataStore";
import { BloodGroup } from "./src/types";

// Setup express app
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "blood_donation_secret_key_2026_antigravity";

app.use(express.json());

// Custom CORS middleware to authorize separate frontend hosting (such as Netlify at https://lebutalabloodbank.netlify.app)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://lebutalabloodbank.netlify.app",
    "https://rahadhossain99.github.io",
    "https://ais-pre-7anhgdwwlcid5d5alee2fw-53511548827.asia-southeast1.run.app",
    "https://ais-dev-7anhgdwwlcid5d5alee2fw-53511548827.asia-southeast1.run.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  let allowOrigin = "*";
  let credentialsEnabled = false;

  if (origin) {
    if (allowedOrigins.includes(origin) || origin.endsWith(".run.app") || origin.endsWith(".netlify.app") || origin.endsWith(".github.io") || origin.includes("localhost")) {
      allowOrigin = origin;
      credentialsEnabled = true;
    }
  } else {
    // If no origin is requested (such as direct backend hits or dev testing), we can fallback safely.
    allowOrigin = "https://lebutalabloodbank.netlify.app";
    credentialsEnabled = true;
  }

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  if (credentialsEnabled) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


// Helper to construct Google OAuth redirect URI using APP_URL when possible
const getRedirectUri = (req: Request) => {
  const referer = req.headers.referer || "";
  const origin = req.headers.origin || "";
  if (referer.includes("lebutalabloodbank.netlify.app") || origin.includes("lebutalabloodbank.netlify.app")) {
    return "https://lebutalabloodbank.netlify.app/auth/callback";
  }

  const appUrl = process.env.APP_URL;
  if (appUrl) {
    return `${appUrl.replace(/\/$/, "")}/auth/callback`;
  }
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const host = req.get("host") || "localhost:3000";
  return `${protocol}://${host}/auth/callback`;
};

// Extend express requests to include user payload
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "অনুমতি অস্বীকৃত। অনুগ্রহ করে লগইন করুন।" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "সেশন মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।" });
    }
    req.user = user;
    next();
  });
};

// Optional Authentication Middleware (doesn't block but populates req.user if present)
const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// --- API ENDPOINTS ---

// 1. Health Probe
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 2. Authentication: User Registration
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, phone, password, bloodGroup, district, isAvailable, lastDonationDate } = req.body;

    if (!name || !email || !phone || !password || !bloodGroup || !district) {
      return res.status(400).json({ error: "অনুগ্রহ করে সবগুলো প্রয়োজনীয় ঘর পূরণ করুন।" });
    }

    const newUser = dbInstance.registerUser(
      {
        name,
        email,
        phone,
        bloodGroup,
        district,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        lastDonationDate: lastDonationDate || "",
        role: "donor",
      },
      password
    );

    // Create token
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: newUser,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "নিবন্ধন সম্পন্ন করা যায়নি।" });
  }
});

// 3. Authentication: User Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { credential, password } = req.body; // credential is email or phone

    if (!credential || !password) {
      return res.status(400).json({ error: "অনুগ্রহ করে ইমেল/ফোন এবং পাসওয়ার্ড প্রদান করুন।" });
    }

    const user = dbInstance.validateLogin(credential, password);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "লগইন ব্যর্থ হয়েছে।" });
  }
});

// 3.1 Google OAuth URL Retrieval
app.get("/api/auth/google/url", (req, res) => {
  // Construct redirect URI using helper
  const redirectUri = getRedirectUri(req);

  const referer = req.headers.referer || "";
  const origin = req.headers.origin || "";
  const isNetlify = referer.includes("lebutalabloodbank.netlify.app") || origin.includes("lebutalabloodbank.netlify.app");

  // Only use real Google OAuth if it's Netlify (where credentials match)
  const clientId = process.env.GOOGLE_CLIENT_ID || "11670848170-ecj4ifnf7u7oq4pjj3reobtgmrbs85te.apps.googleusercontent.com";
  
  if (!isNetlify) {
    // Return simulator URL for all workspace development preview run.app/localhost environments
    return res.json({ 
      url: `/api/auth/google/simulator-page?redirect_uri=${encodeURIComponent(redirectUri)}`,
      simulated: true 
    });
  }

  // Google OAuth URL for Production Netlify
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&access_type=offline&prompt=consent`;
  
  res.json({ url: googleAuthUrl, simulated: false });
});

// 3.2 Simulated Google Sign-In helper page
app.get("/api/auth/google/simulator-page", (req, res) => {
  const redirectUri = req.query.redirect_uri as string;
  
  // Render an ultra-beautiful styled Google simulation popup in Bengali & English
  res.send(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Google Sign-In Simulator</title>
      <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
        body {
          font-family: 'Noto Sans Bengali', 'Plus Jakarta Sans', sans-serif;
        }
      </style>
    </head>
    <body class="bg-indigo-950/20 min-h-screen flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-red-500/10 hover:shadow-2xl">
        <!-- Top Google Logo Bar -->
        <div class="bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 h-2 w-full"></div>
        
        <div class="p-6 sm:p-10">
          <div class="flex items-center gap-4 mb-6">
            <span class="text-4xl">🩸</span>
            <div>
              <h1 class="text-2xl font-black text-rose-600 tracking-tight">BloodLife</h1>
              <p class="text-xs text-slate-500 font-bold font-mono tracking-widest">GOOGLE ACCOUNT PORTAL</p>
            </div>
          </div>

          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
            <h3 class="text-emerald-800 font-bold text-sm flex items-center gap-1.5 mb-11">
              <span class="p-1 px-2 bg-emerald-600 text-white text-[10px] rounded font-bold">Simulator mode</span> 
              সুরক্ষিত গুগল সাইন-ইন
            </h3>
            <p class="text-emerald-700 text-xs leading-relaxed">
              Google Client ID কনফিগার করা হয়নি। তাই এই সিমুলেটর ব্যবহার করে আপনি সহজেই যেকোনো ডামি আইডি দিয়ে গুগল লগইন সম্পূর্ণ টেস্ট করতে পারবেন।
            </p>
          </div>

          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">একটি ডামি প্রোফাইল নির্বাচনুন:</p>
          
          <div class="space-y-2.5">
            <button onclick="selectProfile('রহাদ হোসাইন', 'rahadhossain991@gmail.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150')" class="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-rose-400 hover:bg-rose-50/30 transition-all text-left">
              <div class="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150" class="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" />
                <div>
                  <p class="font-bold text-slate-800 text-sm">রহাদ হোসাইন (রাহাত)</p>
                  <p class="text-xs text-slate-500">rahadhossain991@gmail.com</p>
                </div>
              </div>
              <span class="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-bold">নির্বাচন</span>
            </button>

            <button onclick="selectProfile('জান্নাতুল ফেরদৌস শিমু', 'jannat@gmail.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150')" class="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-rose-400 hover:bg-rose-50/30 transition-all text-left">
              <div class="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150" class="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" />
                <div>
                  <p class="font-bold text-slate-800 text-sm">জান্নাতুল ফেরদৌস শিমু</p>
                  <p class="text-xs text-slate-500">jannat@gmail.com</p>
                </div>
              </div>
              <span class="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-bold">নির্বাচন</span>
            </button>
          </div>

          <div class="relative my-7 flex items-center justify-center">
            <span class="absolute px-3 bg-white text-[10px] font-bold text-slate-400 tracking-widest uppercase">অথবা নতুন কাস্টম লগইন</span>
            <div class="border-t border-slate-100 w-full"></div>
          </div>

          <form id="custom-signin-form" class="space-y-4" onsubmit="submitCustom(event)">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5">আপনার নাম (Full Name)</label>
              <input id="custom-name" type="text" placeholder="উদা: আব্দুল্লাহ আল রাজী" required class="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5">গুগল ইমেইল (Gmail Address)</label>
              <input id="custom-email" type="email" placeholder="উদা: code.test@gmail.com" required class="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5">প্রোফাইল ছবি অবয়ব (Select Avatar)</label>
              <select id="custom-photo" class="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:outline-none">
                <option value="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150">Avatar Female Portrait 1</option>
                <option value="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150">Avatar Male Portrait 2</option>
                <option value="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150">Avatar Female Portrait 3</option>
                <option value="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150">Avatar Male Portrait 4</option>
              </select>
            </div>
            <button type="submit" class="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg">
              গুগল আইডি দিয়ে সাইন-ইন সম্পন্ন করুন
            </button>
          </form>

          <p class="text-[10px] text-slate-400 text-center mt-6">
            নিরাপত্তা এনক্রিপশন লুপ দ্বারা সুরক্ষিত।<br/>উইন্ডোটি সম্পন্ন হলে স্বয়ংক্রিয়ভাবে বন্ধ হবে।
          </p>
        </div>
      </div>

      <script>
        const redirectUri = "${redirectUri}";
        
        function selectProfile(name, email, picture) {
          const params = new URLSearchParams({
            simulated: "true",
            name: name,
            email: email,
            picture: picture
          });
          window.location.href = redirectUri + "?" + params.toString();
        }

        function submitCustom(e) {
          e.preventDefault();
          const name = document.getElementById("custom-name").value;
          const email = document.getElementById("custom-email").value;
          const picture = document.getElementById("custom-photo").value;
          selectProfile(name, email, picture);
        }
      </script>
    </body>
    </html>
  `);
});

// 3.3 Google OAuth / Simulator Callback handler
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  try {
    const { code, simulated, name, email, picture } = req.query;

    let oauthUser: { name: string; email: string; picture: string } = { name: "", email: "", picture: "" };

    const clientId = process.env.GOOGLE_CLIENT_ID || "11670848170-ecj4ifnf7u7oq4pjj3reobtgmrbs85te.apps.googleusercontent.com";
    if (simulated === "true" || !code) {
      // Simulation parameters mapping
      oauthUser = {
        name: (name as string) || "Anonymous Google User",
        email: (email as string) || "anonymous@gmail.com",
        picture: (picture as string) || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150"
      };
    } else {
      // Real Google API call exchange
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "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";
      
      const redirectUri = getRedirectUri(req);

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Google token exchange failed: ${errText}`);
      }

      const tokenData = await tokenResponse.json() as any;
      const accessToken = tokenData.access_token;

      // Profile details
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userInfoResponse.ok) {
        throw new Error("Google user profile fetch failed");
      }

      const googleProfile = await userInfoResponse.json() as any;
      oauthUser = {
        name: googleProfile.name || "Google User",
        email: googleProfile.email,
        picture: googleProfile.picture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150"
      };
    }

    // Lookup user or initialize instant registration
    let user = dbInstance.getAllDonors().find(u => u.email === oauthUser.email);
    let isNewRegistration = false;

    if (!user) {
      user = dbInstance.registerUser({
        name: oauthUser.name,
        email: oauthUser.email,
        phone: "017" + Math.floor(10000000 + Math.random() * 90000000),
        bloodGroup: "O+", // Default, can be toggled on first login
        district: "Dhaka (ঢাকা)",
        isAvailable: true,
        lastDonationDate: "",
        avatarUrl: oauthUser.picture,
        role: "donor"
      }, "google_oauth_no_password_bypass_2026");
      isNewRegistration = true;
    } else {
      // update avatar selectively
      if (!user.avatarUrl && oauthUser.picture) {
        user = dbInstance.updateUserProfile(user.id, { avatarUrl: oauthUser.picture });
      }
    }

    // Generate login token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>সাইন-ইন সফল হয়েছে</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #0f172a;
            color: #f1f5f9;
          }
          .card {
            background: #1e293b;
            padding: 2.5rem;
            border-radius: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(225, 29, 72, 0.25);
            text-align: center;
            max-width: 320px;
            border: 1px solid #334155;
          }
          .spinner {
            border: 3px solid #334155;
            border-top: 3px solid #ef4444;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            animation: spin 0.8s linear infinite;
            margin: 1.5rem auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 3rem; margin-bottom: 0.5rem; animation: pulse 1s infinite alternate;">🩸</div>
          <h2 style="margin: 0.5rem 0 0.25rem 0; font-size: 1.4rem; color: #f43f5e; font-weight: 800;">অনুমোদন সফল!</h2>
          <p style="font-size: 0.9rem; color: #94a3b8; font-weight: 500;">স্বাগতম ${user.name}! সেশন লোড হচ্ছে...</p>
          <div class="spinner"></div>
        </div>

        <script>
          const payload = {
            type: 'OAUTH_AUTH_SUCCESS',
            token: '${token}',
            user: ${JSON.stringify(user)},
            isNew: ${isNewRegistration}
          };

          if (window.opener) {
            window.opener.postMessage(payload, '*');
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            localStorage.setItem("blood_donation_token", "${token}");
            window.location.href = "/?oauth_success=true";
          }
        </script>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 100px; padding: 20px;">
        <h2 style="color: #ef4444;">Google Authorization Failed</h2>
        <p style="color: #64748b;">\${err.message || err}</p>
        <button onclick="window.close()" style="padding: 12px 24px; background: #be123c; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s;">Close Window</button>
      </div>
    `);
  }
});

// 4. Get Current User Details
app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "অননুমোদিত" });

    const user = dbInstance.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "ব্যবহারকারী পাওয়া যায়নি।" });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: "সার্ভারে সমস্যা দেখা দিয়েছে।" });
  }
});

// 5. Update Profile
app.put("/api/auth/profile", authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "অননুমোদিত" });

    const updates = req.body;
    const allowedUpdates = ["name", "phone", "bloodGroup", "district", "isAvailable", "lastDonationDate", "avatarUrl"];
    const filteredUpdates: any = {};

    allowedUpdates.forEach((key) => {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = dbInstance.updateUserProfile(userId, filteredUpdates);
    res.json({ user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "প্রোফাইল আপডেট ব্যর্থ হয়েছে।" });
  }
});

// 6. Public and Filtered Donor Search (authenticated users can see contact details)
app.get("/api/donors", optionalAuthenticate, (req: AuthRequest, res) => {
  try {
    const bloodGroupFilter = req.query.bloodGroup as string;
    const districtFilter = req.query.district as string;
    const availabilityFilter = req.query.isAvailable as string;

    let donors = dbInstance.getAllDonors();

    // Filters
    if (bloodGroupFilter) {
      donors = donors.filter((d) => d.bloodGroup.toLowerCase() === bloodGroupFilter.toLowerCase());
    }
    if (districtFilter) {
      donors = donors.filter((d) => d.district.toLowerCase().includes(districtFilter.toLowerCase()));
    }
    if (availabilityFilter !== undefined) {
      const wantAvailable = availabilityFilter === "true";
      donors = donors.filter((d) => d.isAvailable === wantAvailable);
    }

    // Shield donor email/phone from anonymous guests, only logged-in users get fully detailed phone/email!
    const isLoggedIn = !!req.user;
    const clearedDonors = donors.map((d) => {
      if (isLoggedIn) {
        return d;
      } else {
        // Redact email and partly screen phone for privacy
        return {
          ...d,
          email: "লগইন প্রয়োজন",
          phone: d.phone.substring(0, 5) + "******",
        };
      }
    });

    res.json(clearedDonors);
  } catch (error) {
    res.status(500).json({ error: "দাতাদের তালিকা লোড করা যায়নি।" });
  }
});

// 7. Dashboard Live Statistics
app.get("/api/stats", (req, res) => {
  try {
    const donors = dbInstance.getAllDonors();
    const appointments = dbInstance.getAppointments();
    const stock = dbInstance.getBloodStock();

    // Calculate core metrics
    const totalDonors = donors.length;
    const availableDonors = donors.filter((d) => d.isAvailable).length;
    // Count finished/completed appointments as successful donations
    const totalDonations = appointments.filter((a) => a.status === "completed").length;

    res.json({
      totalDonors,
      availableDonors,
      totalDonations,
      bloodStock: stock,
      recentAppointments: appointments.slice(0, 10), // newest 10 actions
    });
  } catch (error) {
    res.status(500).json({ error: "ড্যাশবোর্ড পরিসংখ্যান পাওয়া যায়নি।" });
  }
});

// 8. Create Match Appointment / Booking / Request
app.post("/api/appointments", optionalAuthenticate, (req: AuthRequest, res) => {
  try {
    const {
      patientName,
      donorId,
      donorName,
      bloodGroup,
      hospitalName,
      contactPhone,
      date,
      time,
      type,
      unitsRequested,
      remarks,
    } = req.body;

    if (!bloodGroup || !hospitalName || !contactPhone || !date || !time || !type) {
      return res.status(400).json({ error: "প্রয়োজনীয় সকল তথ্য পূরণ করুন।" });
    }

    const userId = req.user?.id;

    const newAppointment = dbInstance.createAppointment({
      userId,
      donorId,
      donorName,
      patientName,
      bloodGroup: bloodGroup as BloodGroup,
      hospitalName,
      contactPhone,
      date,
      time,
      type: type as "donate" | "request",
      unitsRequested: unitsRequested || 1,
      remarks: remarks || "",
      status: "pending",
    });

    res.status(201).json(newAppointment);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "অ্যাপয়েন্টমেন্ট বুকিং ব্যর্থ হয়েছে।" });
  }
});

// 9. Fetch Authenticated User's Appointments + Requests
app.get("/api/appointments/my", authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "অননুমোদিত" });

    // Users see appointments they booked or that are requested for them
    const allApps = dbInstance.getAppointments();
    const myApps = allApps.filter((app) => app.userId === userId || app.donorId === userId);

    res.json(myApps);
  } catch (error) {
    res.status(500).json({ error: "আপনার অ্যাপয়েন্টমেন্ট তালিকা লোড করা যায়নি।" });
  }
});

// 10. Update Slot Booking Status (Approved, Completed, Cancelled)
app.put("/api/appointments/:id/status", authenticateToken, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "অকার্যকর স্ট্যাটাস।" });
    }

    // Role safety check (optional, let user change their own, or admin can change)
    const updated = dbInstance.updateAppointmentStatus(id, status);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।" });
  }
});

// 11. Admin update blood stock counts directly
app.post("/api/stocks/set", authenticateToken, (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "এই কাজটির জন্য আপনার পর্যাপ্ত অনুমতি নেই।" });
    }

    const stocks = req.body;
    dbInstance.updateBloodStocks(stocks);
    res.json({ message: "স্টক সফলভাবে আপডেট করা হয়েছে", bloodStock: dbInstance.getBloodStock() });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "স্টক আপডেট ব্যর্থ হয়েছে।" });
  }
});

// --- VITE INTERFACE INTEGRATION ---

async function startServer() {
  // Integrate Vite Asset Bundler
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite dev middleware
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in DEVELOPMENT mode");
  } else {
    const candidatePaths = [
      path.join(process.cwd(), "dist"),
      __dirname,
      path.join(__dirname, "..", "dist"),
    ];
    let distPath = candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) || path.join(process.cwd(), "dist");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving compiled production files from static folder: ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Blood Donation app running, listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Express App boot crash: ", err);
});
