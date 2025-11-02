# Bus Route Info and Ticket Booking System

A modern web application for booking bus tickets in Sri Lanka. This system helps passengers find routes, book seats, and track buses in real-time. It also provides dashboards for drivers, bus owners, and administrators to manage their operations.

## Project Description

This is a complete bus booking platform built for Sri Lankan bus transportation. The system allows passengers to search for bus routes, select seats, and book tickets with instant digital receipts. It supports multiple user roles including passengers, drivers, bus owners, and administrators, each with their own customized dashboard.

The application features bilingual support (Sinhala and English) for better accessibility, real-time bus tracking, secure payment processing, and a progressive web app (PWA) that works offline.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase
  - Authentication (Firebase Auth)
  - Database (Cloud Firestore)
  - Storage (Firebase Storage)
- **State Management**: Redux Toolkit
- **UI Components**: Radix UI, Lucide React Icons
- **Animations**: Framer Motion
- **PWA**: next-pwa
- **Date Handling**: date-fns, react-day-picker

## Main Features

### For Passengers
- **Route Search**: Search buses by origin, destination, or route number with bilingual support
- **Seat Selection**: Interactive seat map to choose preferred seats
- **Ticket Booking**: Secure booking with digital e-tickets and QR codes
- **Dashboard**: View all bookings, ticket history, and booking details
- **Live Tracking**: Track bus location in real-time during journey
- **Payment**: Card payment processing (simulated for demo)

### For Drivers
- **Tour Management**: View assigned tours and manage trip status
- **Passenger List**: See booked passengers for upcoming trips
- **Alerts**: Send alerts and notifications to passengers
- **Route Information**: Access route details and stop information

### For Bus Owners
- **Fleet Management**: Manage buses and assign drivers
- **Earnings Dashboard**: Track revenue share (10% commission) from bookings
- **Performance Analytics**: View earnings history and trip statistics
- **Bus Operations**: Monitor bus assignments and routes

### For Administrators
- **Route Management**: Create, update, and delete bus routes
- **Bus Management**: Add buses, assign drivers and owners
- **User Management**: Manage user accounts and roles
- **System Overview**: Monitor overall system operations

### General Features
- **Bilingual Support**: Search and interface available in Sinhala and English
- **PWA Support**: Install as mobile app for offline access
- **Real-time Updates**: Live data synchronization using Firebase
- **Secure Authentication**: Firebase Authentication with role-based access
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Theme**: Modern dark theme interface
- **QR Code Tickets**: Digital tickets with QR codes for easy verification

## Installation Guide

### Prerequisites

Before you begin, make sure you have the following installed:
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun package manager
- A Firebase project (you'll need to set up Firebase credentials)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd bus_booking_system
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm (recommended):
```bash
pnpm install
```

Or using yarn:
```bash
yarn install
```

### Step 3: Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password method)
3. Create a Firestore database
4. Copy your Firebase configuration

The Firebase configuration is currently set in `lib/firebase/client.ts`. For production, you should move these to environment variables.

### Step 4: Run the Development Server

```bash
npm run dev
```

Or:
```bash
pnpm dev
```

Or:
```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Step 5: Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
bus_booking_system/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages (login, register)
│   ├── booking/           # Booking pages
│   ├── dashboard/         # Role-based dashboards
│   ├── routes/            # Route listing page
│   ├── track/             # Live bus tracking
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── booking/          # Booking-related components
│   ├── layout/           # Layout components (nav, footer)
│   ├── tracking/         # Bus tracking components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── firebase/         # Firebase configuration and functions
│   ├── redux/            # Redux store and slices
│   └── services/         # Business logic services
├── types/                 # TypeScript type definitions
├── store/                 # Additional Redux slices
├── providers/             # React context providers
└── public/                # Static assets and PWA files
```

## User Roles

The system supports four main user roles:

1. **Passenger**: Regular users who book bus tickets
2. **Driver**: Bus drivers who manage tours and trips
3. **Owner**: Bus owners who manage their fleet and earnings
4. **Admin**: System administrators with full access

Users are assigned roles during registration and can access role-specific dashboards.

## Environment Variables

For production deployment, create a `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Development Notes

- The payment system is simulated for demonstration purposes
- PWA features are disabled in development mode
- Firebase configuration is currently hardcoded in the client file (should be moved to env variables for production)
- The app uses TypeScript for type safety
- All components use Tailwind CSS for styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is an academic project. For questions or issues, please contact the development team.

## License

This project was developed as part of an academic module. All rights reserved.

## Credits

Developed by Group 19 for the Bus Route Info and Ticket Booking System project.
