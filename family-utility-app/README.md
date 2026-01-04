# Family Utility App

A modern, mobile-friendly web application for managing family train tickets and medicines.

## Features

### 🚂 Train Ticket Checker
- **Email Parsing**: Upload IRCTC booking confirmation emails to automatically extract ticket details
- **Manual Entry**: Add tickets manually with all journey details
- **Smart Filtering**: Search and filter by date, status, stations, passengers, train number
- **PNR Status Check**: Real-time PNR status checking (requires API key)
- **Trip Analyzer**: Group tickets into trips for better organization
- **Document Storage**: Store important documents (tickets, Aadhar, etc.) per trip
- **Trip Photos**: Upload highlight photos from your trips
- **Places to Visit**: Plan places to visit with Google Maps integration
- **Expense Tracker**: Track trip expenses by category with budget management

### 💊 Medicine Organizer
- **Medicine Tracking**: Store all family medicines with details
- **Photo Storage**: Add up to 2 photos per medicine for easy identification
- **Family Members**: Assign medicines to different family members
- **Dosage Tracking**: Track dosage frequency and timing
- **Stock Management**: Auto-calculated days remaining based on usage
- **Low Stock Alerts**: Get notified when medicines are running low
- **Expiry Tracking**: Track medicine expiry dates
- **Cost Calculator**: Estimate monthly medicine costs per person and overall
- **Google Info Links**: Quick access to medicine information

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Build Tool**: Vite

## Setup Instructions

### 1. Clone and Install

```bash
cd family-utility-app
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Google Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains
4. Create **Firestore Database**:
   - Go to Firestore Database > Create database
   - Start in test mode (we'll add security rules later)
5. Enable **Storage**:
   - Go to Storage > Get started
6. Get your config:
   - Go to Project Settings > General > Your apps
   - Register a web app
   - Copy the config values

### 3. Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Configure Allowed Users

Edit `src/config/constants.ts` and add your email addresses to the `ALLOWED_USERS` array:

```typescript
export const ALLOWED_USERS = [
  'your-email@gmail.com',
  'family-member@gmail.com',
  // Add more emails
];
```

### 5. Run Development Server

```bash
npm run dev
```

## Deployment Options (Free)

### Option 1: Netlify (Recommended) ⭐

**Easiest option with continuous deployment from GitHub**

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign up
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Site settings > Environment variables
7. Deploy!

**Custom domain**: Netlify provides free SSL and custom domain support

### Option 2: Firebase Hosting

**Best integration with Firebase services**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Select your project
# Set public directory to: dist
# Configure as single-page app: Yes

# Build and deploy
npm run build
firebase deploy --only hosting
```

### Option 3: Vercel

**Great performance and DX**

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com) and sign up
3. Import your repository
4. Framework preset: Vite
5. Add environment variables
6. Deploy!

### Option 4: Linux Server (Self-hosted)

**Full control over your deployment**

#### Using Nginx

1. Build the app:
```bash
npm run build
```

2. Copy `dist` folder to your server:
```bash
scp -r dist/* user@your-server:/var/www/family-utility
```

3. Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/family-utility;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. Enable HTTPS with Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

#### Using Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 5: GitHub Pages (Free)

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

Note: Set `base` in `vite.config.ts` to your repo name if not using custom domain.

## Firebase Security Rules

Add these rules to Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## PNR Status API (Optional)

For real-time PNR status checking:

1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to an IRCTC PNR API (many free tiers available)
3. Add your API key to `.env`:
```env
VITE_PNR_API_KEY=your_rapidapi_key
```
4. Update the `checkPNRStatus` function in `src/store/ticketStore.ts` with actual API call

## Project Structure

```
src/
├── components/
│   ├── layout/       # Layout components
│   ├── medicines/    # Medicine-related components
│   ├── trains/       # Train ticket components
│   ├── trips/        # Trip planner components
│   └── ui/           # Reusable UI components
├── config/
│   ├── constants.ts  # App constants & allowed users
│   └── firebase.ts   # Firebase configuration
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── MedicinesPage.tsx
│   └── TrainsPage.tsx
├── store/
│   ├── authStore.ts      # Authentication state
│   ├── medicineStore.ts  # Medicine state
│   └── ticketStore.ts    # Ticket & trip state
├── types/
│   └── index.ts      # TypeScript types
├── App.tsx           # Main app component
├── index.css         # Global styles
└── main.tsx          # Entry point
```

## License

MIT
