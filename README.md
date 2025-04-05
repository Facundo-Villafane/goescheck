# GOES Check-in System

![Login](https://checkin.aeroboost.com.ar/01.gif)

## Overview

GOES Check-in System is a comprehensive desktop application designed for airline check-in and boarding management. Built with Electron, React, and Firebase, it offers a complete solution for managing passenger information, seat assignments, boarding processes, and flight operations in both online and offline environments.

## Features

### Core Functionality
- **Passenger Management:** Add, update, and manage passenger information
- **Check-in Process:** Complete check-in flow with document verification
- **Seat Selection:** Interactive seat map for assigning seats to passengers
- **Boarding Pass:** Generate and print professional boarding passes
- **Baggage Handling:** Track and manage passenger baggage
- **Boarding Process:** Scan and validate boarding passes for flight boarding

### Technical Features
- **Offline Operation:** Full functionality with offline data synchronization
- **Real-time Updates:** Firebase integration for data synchronization across devices
- **Printer Support:** Native printer integration for boarding passes and reports
- **PDF Generation:** Export flight manifests and summaries as PDF documents
- **User Role Management:** Access control with different permission levels
- **Interactive UI:** Modern interface with real-time visual feedback

## Screenshots

<div align="center">
  <img src="https://checkin.aeroboost.com.ar/01.png" alt="Home" width="45%" />
  <img src="https://checkin.aeroboost.com.ar/02.png" alt="Check-in Screen" width="45%" />
  <img src="https://checkin.aeroboost.com.ar/03.png" alt="Boarding" width="45%" />
  <img src="https://checkin.aeroboost.com.ar/04.png" alt="Summary" width="45%" />
  <img src="https://checkin.aeroboost.com.ar/05.png" alt="Flight Summary" width="45%" />
  <img src="https://checkin.aeroboost.com.ar/06.png" alt="Operations" width="45%" />
</div>

## Built With

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [React](https://reactjs.org/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend and real-time database
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [bwip-js](https://github.com/metafloor/bwip-js) - Barcode generation
- [ExcelJS](https://github.com/exceljs/exceljs) - Excel file processing

## Installation

### Prerequisites
- Node.js (v14 or newer)
- npm or yarn
- Firebase account (for production deployment)

### Development Setup
1. Clone the repository
   ```bash
   git clone https://github.com/Facundo-Villafane/goescheck.git
   cd goescheck
   ```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a .env.development file with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
4. Run in development mode
```bash
npm run electron:dev
```

## Building for Production

Create a .env.production file with your production Firebase configuration
Build the application
```bash
npm run electron:build
```
Find the installer in the dist_electron directory

### Project Structure
```/
├── electron/           # Electron main process code
│   ├── main.cjs        # Main entry point
│   └── preload.cjs     # Preload script for IPC
├── src/
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── boarding/   # Boarding process components
│   │   ├── check-in/   # Check-in process components
│   │   ├── common/     # Common/shared components
│   │   ├── layout/     # Layout components
│   │   ├── pre-flight/ # Pre-flight configuration components
│   │   └── summary/    # Reporting components
│   ├── contexts/       # React contexts for state management
│   ├── firebase/       # Firebase configuration
│   ├── pages/          # Application pages
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main React component
│   └── main.jsx        # React entry point
└── package.json        # Project configuration
```

## Usage
### User Roles

Admin: Complete access to all features, including user management
Supervisor: Access to flights, check-in, boarding, and reports
Check-in Agent: Access to flights, check-in, and boarding operations

## Workflow

Configure Flight: Set up flight details, aircraft configuration, and load passenger list
Check-in Passengers: Process passengers with document verification and seat assignment
Print Boarding Passes: Generate and print boarding passes for checked-in passengers
Board Passengers: Scan boarding passes for flight boarding
Generate Reports: Create flight manifests and boarding reports

### Offline Operation
The application stores all necessary data locally to function without an internet connection. When connection is restored, data is automatically synchronized with the Firebase backend.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Facundo Villafañe - Developer
Icons from react-icons
PDF generation using jspdf

## Contact
For support or inquiries, please contact info@aeroboost.com.ar
