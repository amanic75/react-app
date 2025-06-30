# Capacity Chemical AI Platform Demo

A production-quality React demo application for Capacity Chemical's internal AI platform, featuring role-based access control for Admin and Employee users.

## Features

- **Role-based Authentication**: Mock login system with admin and employee roles
- **Modern UI**: Built with React, Vite, and Tailwind CSS
- **Professional Design**: Clean, responsive interface with hover effects
- **AI Inquiry Interface**: Interactive chat-like component with mock responses
- **Chemical Data Management**: Chemformation module displaying chemical formulas
- **User Management**: Admin-only table for managing system users
- **Icon Integration**: Lucide React icons throughout the interface

## Demo Credentials

- **Admin**: admin@capacity.com / password
- **Employee**: employee@capacity.com / password

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Logo.jsx
│   └── shared/          # Feature-specific components
│       ├── AdminDashboard.jsx
│       ├── EmployeeDashboard.jsx
│       ├── AIInquiryBox.jsx
│       ├── ChemformationMockModule.jsx
│       ├── Sidebar.jsx
│       └── UserManagementTable.jsx
├── pages/               # Top-level page components
│   ├── LoginPage.jsx
│   └── DashboardPage.jsx
├── layouts/             # Application layouts
│   └── DashboardLayout.jsx
├── lib/                 # Utilities and data
│   ├── auth.js          # Authentication context
│   └── data.js          # Mock data
└── App.jsx              # Main application component
```

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Context API** - State management for authentication

## Role-Based Features

### Employee Dashboard
- AI Inquiry interface
- Chemformation module access
- Basic navigation (Dashboard, Chemformation, Settings)

### Admin Dashboard
- All employee features
- User Management table
- Additional navigation (User Management, System Health)
- Enhanced permissions

## Key Components

- **Authentication**: Mock system with context-based role management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Reusable UI components with consistent styling
- **Professional UX**: Hover effects, loading states, and smooth transitions

This demo showcases modern React development practices with a focus on clean code, component reusability, and professional UI/UX design. 