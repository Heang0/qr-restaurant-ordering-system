# OrderHey - QR Restaurant Ordering System

A professional, bilingual (Khmer & English) QR-based restaurant ordering system built with Next.js 14.

## Features

- ✅ QR Code Ordering
- ✅ Real-time Orders with Sound Notifications
- ✅ Bilingual Support (Khmer & English)
- ✅ Toast Notifications
- ✅ Loading Skeletons & Empty States
- ✅ Mobile-Friendly Responsive Design
- ✅ Cloudinary Image Uploads
- ✅ Full Menu Management (CRUD)
- ✅ Order Management & Status Updates
- ✅ Table Management with QR Codes
- ✅ Multi-Store Support

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary
- **Deployment:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
2. **Import on Vercel** - https://vercel.com
3. **Add Environment Variables**
4. **Deploy**

### Set Custom Domain

In Vercel Dashboard:
- Settings → Domains
- Add: `order-hey.vercel.app`

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── [storeSlug]/      # Customer ordering
│   │   ├── admin/            # Admin dashboard
│   │   ├── superadmin/       # Super admin
│   │   └── login/            # Login
│   ├── components/
│   │   ├── admin/            # Admin components
│   │   └── order/            # Order components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   └── lib/                  # Utilities
└── public/
    └── sounds/               # Notification sounds
```

## Usage

### Admin Dashboard
- **URL:** `/admin`
- Manage menu, orders, tables

### Super Admin
- **URL:** `/superadmin`
- Manage stores and users

### Customer Ordering
- **URL:** `/[storeSlug]/[tableId]`
- Example: `/orderhey/a1`

## License

MIT
