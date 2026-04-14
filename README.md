# Dokan Pro App

Modern multi-shop billing and customer management app built with React, Firebase, and Material UI.

Live URL: [https://dokan-pro-app.vercel.app/](https://dokan-pro-app.vercel.app/)

## Features

- Phone OTP login (Firebase Authentication)
- Shop-based data isolation (`shops/{shopId}/...`)
- Bill creation with item verification workflow
- Extra cost support (rickshaw, bus, other)
- PDF invoice generation
- Thermal print support
- Customer management (view, edit, delete)
- Bills management (view, edit, delete)
- Confirmation dialogs for edit/delete actions
- Smart bill search:
  - text input -> customer name
  - numeric input -> phone number
- Responsive UI with Material UI

## Tech Stack

- React + Vite
- Material UI (MUI)
- Firebase Authentication
- Cloud Firestore
- Vercel (deployment)

## Project Structure

```text
src/
  component/
  context/
  services/
  Firebase/
firestore.rules
```

## Local Setup

1. Clone the repository:

```bash
git clone https://github.com/Noobcoder2042/dokan-app.git
cd dokan-app
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Firebase Configuration

This app uses Firebase config from `src/Firebase/firebase.js`.

You must configure Firebase Console before use:

1. Create a Firebase project.
2. Enable Authentication:
   - `Authentication` -> `Sign-in method` -> enable `Phone`.
3. Add authorized domains:
   - `localhost`
   - `dokan-pro-app.vercel.app`
4. Create Cloud Firestore database.
5. Deploy Firestore rules from `firestore.rules`.

## Firestore Data Model (High Level)

- `users/{uid}`
- `shops/{shopId}`
- `shops/{shopId}/members/{uid}`
- `shops/{shopId}/bills/{billId}`
- `shops/{shopId}/customers/{customerId}`

## Thermal Print and Bill Save Logic

- `Generate Bill` saves bill to Firestore and generates PDF.
- `Thermal Print` also saves bill before printing.
- Duplicate save protection is included to avoid double writes for the same bill action.

## Deploy to Vercel

```bash
npx vercel login
npx vercel --prod
```

After deployment, add your Vercel domain to Firebase authorized domains.

## Scripts

- `npm run dev` - run app in development mode
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## License

This project is currently private/internal unless you define a license.
