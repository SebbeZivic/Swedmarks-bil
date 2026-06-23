Swedmarks Bil - Car Dealership Platform

A modern, full-stack car dealership management and sales platform built with React and Node.js.
Overview
Swedmarks Bil is a complete web application for managing and selling vehicles online. The platform features a public-facing car catalog where customers can browse available vehicles, save favorites, and view detailed listings. An admin panel allows dealers to manage inventory with full CRUD operations, including image management for each listing.
Features
Public Features

Browse car catalog with responsive grid layout
View detailed car information including specifications and images
Save favorite vehicles to personal wishlist (stored locally)
Filter and search functionality for easy navigation
User authentication with email and password

Admin Features

Complete car inventory management (Create, Read, Update, Delete)
Bulk image uploads (up to 10 images per vehicle)
Image reordering with arrow controls to set cover photo
Real-time form validation with user-friendly error messages
Admin dashboard to view all listings and manage inventory

Tech Stack
Frontend

React 18+ with Vite for fast development and building
React Router DOM for client-side routing
Axios for API communication
CSS-in-JS for component styling
LocalStorage API for favorites persistence

Backend

Node.js with Express.js web framework
MongoDB with Mongoose ODM for data modeling
JWT (JSON Web Tokens) for user authentication
bcryptjs for password hashing and security
express-validator for input validation and sanitization
Multer for file upload handling

Database

MongoDB Atlas for cloud database hosting
Mongoose schema validation

Installation
Prerequisites

Node.js v24.16.0 or higher
npm or yarn package manager
MongoDB Atlas account for database

Backend Setup

Navigate to backend directory:

bashcd backend

Install dependencies:

bashnpm install

Create .env file with the following variables:

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swedmarks-bil?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development

Start the development server:

bashnpm run dev
The backend will run on http://localhost:5000
Frontend Setup

Navigate to frontend directory:

bashcd frontend

Install dependencies:

bashnpm install

Start the development server:

bashnpm run dev
The frontend will run on http://localhost:5173
Usage
For Customers

Visit the catalog page to browse available vehicles
Click on any car to view detailed information and full image gallery
Use the heart icon to add vehicles to your favorites (saved locally)
Log in to access additional features (future implementation)

For Dealers

Navigate to /admin (requires login)
Fill out the car details form with vehicle information
Upload images (drag and drop or click to select, max 10 per vehicle)
Use arrow buttons to reorder images and set the cover photo
Click "Add Car" to create the listing
Edit or delete existing listings from the "My Cars" section

Project Structure
swedmarks-bil/
├── backend/
│ ├── models/ # MongoDB schemas (User, Car)
│ ├── controllers/ # Business logic (auth, cars, images)
│ ├── routes/ # API endpoints
│ ├── middleware/ # Authentication and validation
│ ├── server.js # Express application setup
│ └── .env # Environment variables
│
└── frontend/
├── src/
│ ├── components/ # Reusable UI components (Navbar)
│ ├── pages/ # Full page components (Login, Catalog, Admin, Detail)
│ ├── services/ # API client (axios instance)
│ ├── context/ # React Context (AuthContext)
│ ├── App.jsx # Main router setup
│ └── index.css # Global styles
└── vite.config.js # Vite configuration

API Endpoints
Authentication

POST /api/auth/register - Register new user
POST /api/auth/login - User login

Cars (Public)

GET /api/cars - Get all cars
GET /api/cars/:id - Get single car details

Cars (Admin - requires authentication)

POST /api/cars - Create new car
PUT /api/cars/:id - Update car
DELETE /api/cars/:id - Delete car

Images (Admin)

POST /api/images/:carId - Upload image for car
DELETE /api/images/:carId/:imageIndex - Delete specific image

Design System
Color Palette

Primary Blue: #285570
Light Beige: #e3ded7
Off-White: #faf7f6
Medium Gray: #cbcac7
Dark Gray: #333333

Design Principles

Mobile-first responsive design
Accessible form inputs and navigation
Clear visual hierarchy with typography
Consistent spacing and border radius (8px)

Future Enhancements

Cloudinary integration for image storage and optimization
Advanced search and filtering by price range, year, fuel type, etc.
Drag-and-drop image reordering in admin panel
Image gallery with zoom functionality on detail pages
Email notifications for new listings
User dashboard to track saved favorites and inquiry history
Deployment to production (Render for backend, Vercel for frontend)
SEO optimization for search engine visibility
Analytics dashboard for dealer insights
Payment integration for potential future booking system

Security Considerations

Password hashing with bcryptjs (10 salt rounds)
JWT-based authentication with secure token storage
Input validation on both client and server sides
CORS enabled for cross-origin requests
Request payload size limits to prevent abuse
Protected admin routes requiring authentication

Performance

Vite for fast development build times
React Router for client-side routing (no full page reloads)
Optimized MongoDB queries with proper indexing
Base64 image encoding for storage (future: migrate to CDN)
Responsive grid layouts using CSS Grid

Contributing
This is a portfolio project created for educational purposes and CV demonstration.
Author
Sebastian Zivic

GitHub: github.com/SebbeZivic
Project: github.com/SebbeZivic/swedmarks-bil
