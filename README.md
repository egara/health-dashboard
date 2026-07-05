# 🏃‍♂️ Personal Health Dashboard

A minimalist, highly aesthetic, and fully customizable personal health dashboard built with Next.js. It integrates directly with the **Google Health / Google Fit API** to fetch your daily activities, workouts, and cardio metrics, displaying them in a sleek glassmorphism UI.

## ✨ Features

- **Google Health Sync:** Automatically fetches your exercise sessions, active zone minutes, calories, and distances.
- **Activity Calendar Heatmap:** Visualizes your training frequency over the month (GitHub-style contribution graph).
- **Distribution Charts:** Interactive Donut charts breaking down your session types (Running, Walking, Biking, etc.).
- **Dynamic Filtering:** Filter data by preset time ranges (Today, 7 days, 30 days) or select specific workout categories.
- **Glassmorphism UI:** A premium, modern dark mode interface with smooth micro-animations.
- **Privacy First:** Designed for self-hosting. Your health data stays directly between Google's servers and your own dashboard.

## 🚀 Getting Started

This application is designed for **personal use (self-hosting)**. To run it, you'll need to create your own credentials in the Google Cloud Console.

### 1. Google Cloud Setup (OAuth 2.0)
Because health data is sensitive, you need to authorize the application to read your profile.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project.
3. Navigate to **APIs & Services** > **Library** and enable the **Fitness API**.
4. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Select **External** user type.
   - Fill in the required app name and developer email.
   - Under **Scopes**, add `.../auth/fitness.activity.read` and `.../auth/fitness.location.read` (or any health scopes you require).
   - Under **Test Users**, add your personal `@gmail.com` address.
   - **Important:** Leave the Publishing Status as **Testing**. Do not publish the app to avoid Google's strict verification process.
5. Navigate to **APIs & Services** > **Credentials**:
   - Create **OAuth client ID** (Application type: Web application).
   - Add Authorized JavaScript origins: `http://localhost:3000`
   - Add Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Copy your **Client ID** and **Client Secret**.

*(Note: Because the app stays in "Testing" mode, the Google session will expire every 7 days. You will need to click "Sign in" once a week. This is normal for self-hosted apps on standard Google accounts).*

### 2. Environment Variables

Clone the repository and create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill it with your credentials:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth configuration
# Generate a secret using: openssl rand -base64 32
NEXTAUTH_SECRET=your_super_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Installation & Running

You must have your `.env.local` file correctly configured before starting the application, otherwise authentication will fail.

#### Option A: Running Locally (Node.js)
Ensure you have Node.js installed, then run:

```bash
npm install
npm run dev
```

#### Option B: Running with Docker (Recommended for Production)
If you prefer a clean, containerized deployment, you can use Docker. We provide two configurations: one for production (pulling the pre-built image) and one for development (building locally).

Ensure you have Docker installed and your `.env` file properly configured.

**For Production (Pre-built Image):**
This uses the lightweight, pre-built image from the GitHub Container Registry.
1. Use the production compose file:
```bash
docker compose -f docker-compose.prod.yml up -d
```

**For Development (Local Build):**
If you want to modify the code and see live changes, use the default development compose file:
1. Build the image and start the container with local volume mounts:
```bash
docker compose up -d --build
```

**Managing the Container:**
To stop the container or view logs:
```bash
docker compose logs -f
docker compose down
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click **Sign in with Google**, grant the permissions, and enjoy your personal health insights!

## 🛠 Tech Stack

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Authentication:** [NextAuth.js v4](https://next-auth.js.org/)
- **Styling:** Vanilla CSS (CSS Modules & Global styles)
- **Data:** Google Health API / Google Fit REST API

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
