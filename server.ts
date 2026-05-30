import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;
const MENU_FILE_PATH = path.join(process.cwd(), "data", "menu.json");
const ADMIN_FILE_PATH = path.join(process.cwd(), "data", "admin.json");

const ADMIN_PASSWORD = "Romanapizza2026web";
const EXPECTED_TOKEN = "romana_admin_session_token_2026";

// Middleware to parse requests
app.use(express.json());

// Helper function to read/write credentials data
interface AdminData {
  email: string;
  passwordHash: string;
  salt: string;
  verified: boolean;
  verificationCode: string;
  verificationExpires: string;
  sessionToken: string | null;
  sessionExpires: string | null;
}

function readAdminData(): AdminData | null {
  try {
    if (!fs.existsSync(ADMIN_FILE_PATH)) {
      return null;
    }
    const data = fs.readFileSync(ADMIN_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading admin file:", err);
    return null;
  }
}

function writeAdminData(data: AdminData) {
  try {
    const adminDir = path.dirname(ADMIN_FILE_PATH);
    if (!fs.existsSync(adminDir)) {
      fs.mkdirSync(adminDir, { recursive: true });
    }
    fs.writeFileSync(ADMIN_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing admin file:", err);
    return false;
  }
}

// Password cryptography hash helper
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// Mailer function to send verification codes to Admin
async function sendVerificationEmail(email: string, code: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log(`[AUTH SYSTEM] Generated verification PIN: [ ${code} ] for admin email: ${email}`);

  if (!host || !user || !pass) {
    console.warn("[AUTH SYSTEM] SMTP details are not configured. Bypassing live mail sending.");
    console.log(`[DEVELOPMENT HELP] Direct verification code is: ${code}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Romana Pizza Admin Terminal" <${user}>`,
      to: email,
      subject: "🔒 Romana Pizza - Admin Verification PIN",
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 500px; margin: 0 auto; border: 3px solid #1c1917; padding: 25px; background-color: #fbfbf9; color: #1c1917;">
          <h2 style="text-align: center; color: #b91c1c; font-size: 20px; text-transform: uppercase; margin-bottom: 20px; font-weight: 900; letter-spacing: 1px;">ROMANA PIZZA TIRANA</h2>
          <div style="border-top: 2px solid #1c1917; border-bottom: 2px solid #1c1917; padding: 15px 0; margin-bottom: 20px;">
            <p style="font-size: 13px; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0;">ADMINISTRATOR ACTIVATION</p>
            <p style="font-size: 11px; line-height: 1.5; color: #44403c; text-transform: uppercase; margin: 0;">
              Use the single-use verification PIN below to secure your credentials and activate your remote management console.
            </p>
          </div>
          <div style="background-color: #ffffff; border: 2px dashed #1c1917; padding: 20px 0; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 9px; text-transform: uppercase; color: #78716c; letter-spacing: 1px; display: block; margin-bottom: 8px;">SECURITY VERIFICATION PIN</span>
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 3px; color: #b91c1c;">${code}</span>
          </div>
          <p style="font-size: 10px; color: #78716c; text-transform: uppercase; text-align: center; line-height: 1.4; margin: 0 0 15px 0;">
            This security code can only be used once and expires in 15 minutes.
          </p>
          <hr style="border: 0; border-top: 1px dashed #d6d3d1; margin-bottom: 15px;" />
          <p style="font-size: 8px; text-align: center; color: #a8a29e; text-transform: uppercase; margin: 0;">
            Romana Pizza • Rruga Ëngjëll Marashi, Tiranë 1052, Albania
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[AUTH SYSTEM] Email sent to: ${email} with PIN: ${code}`);
    return { sent: true };
  } catch (err) {
    console.error("[AUTH SYSTEM] Nodemailer error dispatcher failed:", err);
    return { sent: false, error: err };
  }
}

// Session authorization gatekeeper middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"] || req.headers["x-admin-token"];
  let token = "";

  if (authHeader) {
    const val = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    token = val.startsWith("Bearer ") ? val.slice(7) : val;
  }

  if (!token) {
    return res.status(401).json({ error: "Access denied: Missing administration session token." });
  }

  if (token !== EXPECTED_TOKEN) {
    return res.status(401).json({ error: "Access denied: Invalid or expired administrator session." });
  }

  next();
}

// Helper function to read from JSON file
function readMenuData() {
  try {
    if (!fs.existsSync(MENU_FILE_PATH)) {
      // Create path and empty file if doesn't exist
      const menuDir = path.dirname(MENU_FILE_PATH);
      if (!fs.existsSync(menuDir)) {
        fs.mkdirSync(menuDir, { recursive: true });
      }
      fs.writeFileSync(MENU_FILE_PATH, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const data = fs.readFileSync(MENU_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading menu file:", err);
    return [];
  }
}

// Helper function to write to JSON file
function writeMenuData(data: any) {
  try {
    const menuDir = path.dirname(MENU_FILE_PATH);
    if (!fs.existsSync(menuDir)) {
      fs.mkdirSync(menuDir, { recursive: true });
    }
    fs.writeFileSync(MENU_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing menu file:", err);
    return false;
  }
}

const STATS_FILE_PATH = path.join(process.cwd(), "data", "orders.json");

function readStatsData() {
  try {
    if (!fs.existsSync(STATS_FILE_PATH)) {
      const statsDir = path.dirname(STATS_FILE_PATH);
      if (!fs.existsSync(statsDir)) {
        fs.mkdirSync(statsDir, { recursive: true });
      }
      const initialStats = {
        earnings: 0,
        deliveries: 0,
        recentOrders: [],
        visits: 0
      };
      fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(initialStats, null, 2), "utf8");
      return initialStats;
    }
    const data = fs.readFileSync(STATS_FILE_PATH, "utf8");
    const parsed = JSON.parse(data);
    // Auto-detect and reset old pre-populated mock statistics
    if (parsed.earnings === 142800 || parsed.deliveries === 164) {
      const resetStats = {
        earnings: 0,
        deliveries: 0,
        recentOrders: [],
        visits: 0
      };
      fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(resetStats, null, 2), "utf8");
      return resetStats;
    }
    if (parsed.visits === undefined) {
      parsed.visits = 0;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading stats file:", err);
    return { earnings: 0, deliveries: 0, recentOrders: [], visits: 0 };
  }
}

function writeStatsData(data: any) {
  try {
    const statsDir = path.dirname(STATS_FILE_PATH);
    if (!fs.existsSync(statsDir)) {
      fs.mkdirSync(statsDir, { recursive: true });
    }
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing stats file:", err);
    return false;
  }
}

// API Routes

// ---- ADMIN AUTHENTICATION ENDPOINTS ----

// GET admin system status
app.get("/api/admin/status", (req, res) => {
  // Check authorization header
  const authHeader = req.headers["authorization"] || req.headers["x-admin-token"];
  let token = "";
  if (authHeader) {
    const val = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    token = val.startsWith("Bearer ") ? val.slice(7) : val;
  }

  const sessionValid = (token === EXPECTED_TOKEN);

  return res.json({
    hasAdmin: true,
    loggedIn: sessionValid,
    email: sessionValid ? "admin@romanapizza.com" : null,
    verified: true
  });
});

// Setup Initial Administrator Credentials (Bypassed since predefined)
app.post("/api/admin/setup", async (req, res) => {
  return res.status(400).json({ error: "Administration has already been configured. Please use sign-in." });
});

// Admin Authentication Sign-In (Password - login instantly)
app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid password." });
  }

  return res.json({
    success: true,
    message: "Owner portal authentication successful!",
    token: EXPECTED_TOKEN,
    email: "admin@romanapizza.com",
    verified: true
  });
});

// Complete PIN Verification (Bypassed)
app.post("/api/admin/verify", (req, res) => {
  return res.json({
    success: true,
    token: EXPECTED_TOKEN,
    email: "admin@romanapizza.com"
  });
});

// Resend Verification (Bypassed)
app.post("/api/admin/resend", async (req, res) => {
  return res.json({
    success: true,
    message: "Code verification bypassed."
  });
});

// Terminate Admin Session / Sign out
app.post("/api/admin/logout", (req, res) => {
  return res.json({ success: true, message: "Logged out. Admin console locked." });
});


// ---- PUBLIC AND RESTAURANT CORE ENDPOINTS ----

// GET all menu items
app.get("/data/menu.json", (req, res) => {
  const menuItems = readMenuData();
  res.json(menuItems);
});

// POST register site visitor / page-views count (PUBLIC)
app.post("/api/visit", (req, res) => {
  const stats = readStatsData();
  stats.visits = (stats.visits || 0) + 1;
  writeStatsData(stats);
  res.json({ success: true, visits: stats.visits });
});

// POST reorder all menu items (PROTECTED - Admin only)
app.post("/data/menu.json/reorder", authMiddleware, (req, res) => {
  const { orderedIds } = req.body;
  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.status(400).json({ error: "Invalid orderedIds array parameter" });
  }

  const menuItems = readMenuData();
  const reorderedItems = [];

  // Match existing items by order
  for (const id of orderedIds) {
    const matched = menuItems.find((i: any) => i.id === id);
    if (matched) {
      reorderedItems.push(matched);
    }
  }

  // Fallback: put any newly added or un-sequenced items at the end
  for (const original of menuItems) {
    if (!orderedIds.includes(original.id)) {
      reorderedItems.push(original);
    }
  }

  writeMenuData(reorderedItems);
  res.json({ success: true, menu: reorderedItems });
});

// GET orders stats (PROTECTED - Admin panel ONLY)
app.get("/data/orders.json/stats", authMiddleware, (req, res) => {
  const stats = readStatsData();
  res.json(stats);
});

// POST a new order (PUBLIC - Customer checkout)
app.post("/data/orders.json", (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.customerName || !newOrder.total) {
    return res.status(400).json({ error: "Invalid order data" });
  }

  const stats = readStatsData();
  stats.deliveries += 1;
  stats.earnings += Number(newOrder.total);

  const orderItem = {
    id: Date.now().toString(),
    customerName: newOrder.customerName,
    address: newOrder.address || "Click & Collect (Rruga Ëngjëll Marashi)",
    itemsSummary: newOrder.itemsSummary || "Artisan Pizza Choice",
    total: Number(newOrder.total),
    timestamp: new Date().toISOString(),
    status: "Delivered"
  };

  stats.recentOrders.unshift(orderItem);
  if (stats.recentOrders.length > 20) {
    stats.recentOrders = stats.recentOrders.slice(0, 20);
  }

  writeStatsData(stats);
  res.json({ success: true, stats, order: orderItem });
});

// POST a new item or UPDATE an existing one (PROTECTED - Admin only)
app.post("/data/menu.json", authMiddleware, (req, res) => {
  const item = req.body;
  if (!item || typeof item !== "object") {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const menuItems = readMenuData();

  if (item.id) {
    // Update existing item
    const index = menuItems.findIndex((i: any) => i.id === item.id);
    if (index !== -1) {
      menuItems[index] = { ...menuItems[index], ...item };
      writeMenuData(menuItems);
      return res.json({ success: true, item: menuItems[index] });
    } else {
      // If client supplied an ID but it wasn't found, insert as new with that ID or generate one
      menuItems.push(item);
      writeMenuData(menuItems);
      return res.json({ success: true, item });
    }
  } else {
    // Create new item
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    menuItems.push(newItem);
    writeMenuData(menuItems);
    return res.json({ success: true, item: newItem });
  }
});

// DELETE a menu item (PROTECTED - Admin only)
app.delete("/data/menu.json/:id", authMiddleware, (req, res) => {
  const { id } = req.params;
  const menuItems = readMenuData();
  const filteredItems = menuItems.filter((i: any) => i.id !== id);

  if (menuItems.length === filteredItems.length) {
    return res.status(404).json({ error: "Item not found" });
  }

  writeMenuData(filteredItems);
  res.json({ success: true, id });
});

let viteInstance: any = null;

// Support deep linking to /admin by serving the SPA index.html
app.get("/admin", async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    try {
      let indexHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
      if (viteInstance) {
        indexHtml = await viteInstance.transformIndexHtml(req.url, indexHtml);
      }
      return res.status(200).set({ "Content-Type": "text/html" }).end(indexHtml);
    } catch (err) {
      return res.sendFile(path.join(process.cwd(), "index.html"));
    }
  } else {
    return res.sendFile(path.join(process.cwd(), "dist", "index.html"));
  }
});

// Setup Vite development server or production environment
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    viteInstance = vite;
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((error) => {
  console.error("Failed to start Vite:", error);
});
