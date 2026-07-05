# Real Estate Admin Panel

A modern administration dashboard for operating the Eskan real estate platform. The panel provides a centralized workspace for managing properties, users, inquiries, agents, content, and analytics through a secure React-based interface.

## Live Demo

Visit the live application at: [https://react-real-estate-admin-panel.netlify.app](https://react-real-estate-admin-panel.netlify.app)

## What the Admin Panel Covers

- Dashboard metrics and business insights
- Property management with create, edit, publish, and archive flows
- User and role management
- Inquiry and contact submission handling
- Agent approval and profile administration
- Blog, testimonial, and content management
- Profile and account settings for administrators

## Tech Stack

- React 18
- React Router v6
- React Bootstrap and Material UI
- Chart.js with react-chartjs-2
- React Quill for rich content editing
- Context API for application state
- JWT-based authentication with the backend API
- Bootstrap 5 and custom CSS styling

## Backend Integration

The admin panel communicates with the backend services through a REST API and uses JWT tokens for authenticated sessions. Platform data is persisted in MongoDB and surfaced in the admin experience in real time through the backend endpoints.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode on port 5000.
Open [http://localhost:5000](http://localhost:5000) to view it in your browser.

### `npm run build`

Builds the app for production into the `build` folder.

### `npm test`

Runs the test suite in watch mode.

### `npm run dev`

Starts the frontend development server.

## Deployment

The project is configured for deployment on Netlify using the included `netlify.toml` configuration.

## Screenshots

![Dashboard](public/img/dashboard-screenshot.jpg)
*Executive dashboard with performance insights*

![Property Management](public/img/properties-screenshot.jpg)
*Property management interface*

## License

This project is proprietary and confidential.

---
Developed by Abbas SK
