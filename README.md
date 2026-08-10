# Abhishek Garg — Personal Portfolio, CMS, & AI Assistant

A premium, production-grade developer portfolio, Content Management System (CMS), and administrative dashboard. This platform is designed to showcase professional experience, projects, certifications, and education, featuring a live-updating PDF resume builder, a visitor inbox with direct email replying, and a Google Gemini-powered AI Portfolio Copilot for ATS optimizations.

---

## 🚀 Core Features

### 1. Live Developer Portfolio (Client Site)
* **Premium Aesthetics**: Harmonious dark mode design built with modern styling, fluid gradients, responsive layouts, and micro-animations via **Framer Motion**.
* **Interactive Career Journey**: An animated timeline showcasing employment history, education, and milestones.
* **Certificate Image Lightboxes**: Dynamic support for viewing credentials. Clicking on any certificate launches a custom image viewer with a premium, blurred backdrop overlay built using base-ui Dialog primitives.
* **Contact & Lead Capture**: A responsive contact form that validates user inputs and automatically sends a beautifully formatted, branded HTML auto-acknowledgment email to the sender.

### 2. Live-Updating PDF Resume Generator
* **Print-Ready Designs**: Compiled dynamically on the server via `@react-pdf/renderer` using elegant fonts and precise spacing rules.
* **Flowing Content Layouts**: Combined into a single, continuous flow template to avoid forced page breaks and empty vertical space.
* **Inline Contact Separators**: Contact elements wrap naturally, preventing dangling pipe (` | `) separators.
* **Dynamic File Naming**: Automatically names downloaded resumes matching the pattern `[Candidate_Name]_[YYYY-MM-DD].pdf` depending on the current date of download.

### 3. AI Assistant & Bulk Editor Dashboard
* **Split-Pane Admin Workspace**: A private control center located at `/admin/ai-assistant` that lets you manage all your data collections in one place.
* **ATS Optimization & Humanization Presets**: Integrated with Google Gemini API (`gemini-flash-latest`) using targeted prompt guidelines (the STAR method, active verbs, and filters preventing robotic AI jargon like *delve* or *seamlessly*).
* **Unified Sidebar Differences**: Displays all recommended changes side-by-side. Allows you to apply suggestions **line-by-line / field-by-field** or **all in one go**, committing updates securely to MongoDB.
* **Field-Wise AI Optimizations**: Added a dedicated `"Ask AI"` trigger next to text inputs (Bio, Experience Bullets, Projects). Opens a dialog where you can enter specific instructions (e.g. *"emphasize cloud scale"*), generate suggestions for just that field, and apply them.

### 4. Admin Inbox & Mailer Hub
* **Message Status Logs**: Displays incoming contact queries with `"Read"` / `"Unread"` flags and dedicated badges.
* **Direct Dashboard Replying**: Click on any message to review query history. Write a custom response and send a formatted HTML reply directly from the control panel. Sent messages quote the visitor's original text, mark the inbox item as Replied, and log response logs.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, Base UI, Lucide Icons.
* **Database & CMS Layer**: MongoDB, Mongoose ORM (packaged with cache-clearing middleware to support Next.js HMR).
* **AI Engine**: Google Gen AI SDK (`gemini-flash-latest` model) with up to 6 rotated API keys for rate-limit resilience.
* **Email Mailer**: Nodemailer with SMTP transport.
* **Media Storage**: Cloudinary (integrated with secure client upload streams for certifications/achievements images).

---

## 📂 Project Structure

```
├── scripts/
│   └── seed-data.ts        # Script to seed initial database collections
├── src/
│   ├── app/
│   │   ├── admin/          # Admin pages (AI Assistant, Messages inbox, etc.)
│   │   ├── api/            # API endpoints (portfolio-data, mailer replies)
│   │   └── page.tsx        # Portfolio client facing homepage
│   ├── components/         # Shared React elements (loaders, timeline cards)
│   │   ├── resume/         # React-PDF resume templates
│   │   └── ui/             # Core base components (buttons, tabs, dialogs)
│   ├── lib/
│   │   ├── ai/prompts/     # Gemini system and template prompt prompt configs
│   │   ├── gemini.ts       # Google Gen AI key-rotation client helper
│   │   └── mongodb.ts      # Mongoose connection wrapper
│   └── models/             # Mongoose schemas (Achievement, Certification, etc.)
├── .env.example            # Environment variables placeholder config
├── package.json            # Node project configuration and dependencies
└── tsconfig.json           # TypeScript compilation settings
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root folder with the following variables:

```env
# Database Settings
MONGODB_URI=mongodb://localhost:27017/abhishek-portfolio
JWT_SECRET=your_jwt_secret_phrase

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# SMTP Mailer Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
CONTACT_RECEIVER_EMAIL=your_email@gmail.com

# Gemini AI Configuration (Rotates up to 6 keys for rate limit protection)
GEMINI_API_KEY_1=your_first_google_ai_studio_key
GEMINI_API_KEY_2=your_second_google_ai_studio_key
GEMINI_MODEL=gemini-flash-latest
```

---

## 🏃 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Initial Portfolio Data
```bash
# Seed default content into MongoDB
npm run seed

# Reset database and seed fresh content
npm run seed:reset
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser.

### 4. Build & Production Check
Ensure your TypeScript compilation passes clean:
```bash
npx tsc --noEmit
npm run build
```

---

## 🛡️ License

This project is licensed under the MIT License — see the [package.json](package.json) file for details.
