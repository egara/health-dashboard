# MyHealth Dashboard

A modern, glassmorphism-themed health dashboard built with Next.js (App Router), React, and Docker. It seamlessly connects with the **Google Health API v4** (which unifies Fitbit data) to extract and visualize your real workouts, active zone minutes (Cardio Load), heart rate zones, and calories burned.

## Features

- **Google Health API v4 Integration**: Directly queries `health.googleapis.com` to fetch authentic workout data securely.
- **Advanced Filtering**: Filter your workouts by dynamic date ranges (7 days, 30 days, 1 year, or custom date pickers).
- **Activity Specific Metrics**: Detailed breakdown of exercises, including the exact recording device (e.g., Pixel Watch 3), data source (Fitbit), and heart rate zones (Light, Moderate, Vigorous, Peak).
- **Modern UI**: Dark mode aesthetic with premium glassmorphism styling, micro-animations, and responsive layouts.
- **Secure Authentication**: Built-in NextAuth.js OAuth integration with Google.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 20+ (if running outside Docker)
- A Google Cloud Project with the **Google Health API** enabled and OAuth credentials configured.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/myhealth-dashboard.git
   cd myhealth-dashboard
   ```

2. **Configure Environment Variables:**
   This project uses an inverted environment variable setup to protect your secrets:
   - `.env.local` is committed to the repository and contains fake template values.
   - `.env` is ignored by Git and should contain your real sensitive data.
   
   Create a `.env` file in the root of the project by copying the template:
   ```bash
   cp .env.local .env
   ```
   
   Then, edit the `.env` file with your real credentials:
   ```env
   # Google OAuth Credentials
   GOOGLE_CLIENT_ID=your_real_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_real_client_secret
   
   # NextAuth Secret (generate a random string)
   NEXTAUTH_SECRET=a_secure_random_string
   
   # NextAuth URL (default for local dev)
   NEXTAUTH_URL=http://localhost:3000
   ```
   *Note: Docker Compose is configured to explicitly load `.env`, overriding any fake values from `.env.local`.*

3. **Run with Docker:**
   We use a Docker setup that mounts local volumes for `node_modules` and `.next` to preserve caching and avoid permission issues.
   
   First, create the local data directories:
   ```bash
   mkdir -p data/node_modules data/.next
   ```
   
   Then, start the application:
   ```bash
   docker compose up --build
   ```

4. **Access the Dashboard:**
   Open [http://localhost:3000](http://localhost:3000) in your browser. Click "Sign in with Google" and authorize the application to read your health data.

## Google Cloud Console Setup

To use the Google Health API, you must configure your OAuth consent screen:

1. Enable the **Google Health API** in your Google Cloud Console.
2. Go to **APIs & Services > Credentials** and create an **OAuth 2.0 Client ID** for a Web Application.
3. Add `http://localhost:3000` to Authorized JavaScript origins.
4. Add `http://localhost:3000/api/auth/callback/google` to Authorized redirect URIs.
5. In the **OAuth Consent Screen**, make sure you request the following scope:
   - `https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly`

## Troubleshooting

- **No Workouts Showing Up?** Ensure that your Fitbit or smartwatch is synced with Google Health / Health Connect. Note that Health Connect typically only backfills the last 30 days of history to new apps by default.
- **Docker `node_modules` Issues:** If you encounter `module not found` errors, clear the local data cache and rebuild: `docker compose down -v` followed by `docker compose up --build`.

## License

MIT License. See [LICENSE](LICENSE) for more information.
