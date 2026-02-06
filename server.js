const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500", "*"],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString().split('T')[1].split('.')[0]} - ${req.method} ${req.url}`);
    next();
});

// ===== API ROUTES (MUST COME FIRST) =====

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Portfolio backend is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// Contact form endpoint
app.post("/api/contact", (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required"
            });
        }
        
        console.log("📧 Contact form submission:", { name, email, subject });
        
        // Save to file (for demo)
        const fs = require("fs");
        const contactData = {
            name,
            email,
            subject: subject || "No subject",
            message,
            timestamp: new Date().toISOString(),
            ip: req.ip
        };
        
        fs.appendFileSync(
            "contacts.log",
            JSON.stringify(contactData) + "\n",
            "utf8"
        );
        
        res.json({
            success: true,
            message: "Thank you! Your message has been received. I'll get back to you soon.",
            data: { name, email }
        });
        
    } catch (error) {
        console.error("❌ Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Analytics endpoint
app.post("/api/analytics/view", (req, res) => {
    console.log("📊 Page view:", req.body);
    res.json({ success: true });
});

// ===== STATIC FILE SERVING (FOR FRONTEND) =====

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, "..")));

// For any other route, serve index.html (SPA routing)
app.get("*", (req, res) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found"
        });
    }
    
    // Serve the main HTML file
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ===== ERROR HANDLING =====

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`
    🚀 Portfolio Backend Server
    ===========================
    🌐 Frontend: http://localhost:${PORT}
    🔧 API Health: http://localhost:${PORT}/api/health
    📁 Static files: Serving from ${path.join(__dirname, "..")}
    ✅ Status: Running on port ${PORT}
    
    📝 API Endpoints:
       GET  /api/health           - Health check
       POST /api/contact          - Contact form
       POST /api/analytics/view   - Page analytics
    `);
});