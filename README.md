# DDU Resource Management System (RMS)

## Overview
DDU Resource Management System is a comprehensive web application designed to manage university resources efficiently. The system supports multiple user roles and provides role-specific functionalities for resource management, requests, and approvals.

## Features

### User Management
- Multiple user roles:
  - System Admin
  - DDU Asset Manager
  - IoT Asset Manager
  - Staff
  - Technical Team
  - Department Head
  - School Dean
- Role-based access control
- User profile management
- Status tracking (pending, approved, rejected)

### Resource Management
- Asset tracking and management
- Resource allocation
- Resource transfer requests
- Asset history tracking
- Department-specific resource management
- School-level resource oversight

### Organizational Structure
- School-based hierarchy
  - School of Computing
  - School of Business and Economics
  - School of Health Science
- Department-level management
- Role-specific permissions

### Request System
- Resource request submission
- Request approval workflow
- Transfer request management
- Notification system
- Request history tracking

## Technical Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer for file uploads

### Frontend
- React.js
- Material-UI (MUI)
- Redux for state management
- React Router for navigation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup Steps

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

3. Install frontend dependencies:
\`\`\`bash
cd frontend
npm install
\`\`\`

4. Set up environment variables:
Create .env files in both backend and frontend directories:

Backend (.env):
\`\`\`
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5003
\`\`\`

Frontend (.env):
\`\`\`
REACT_APP_API_URL=http://localhost:5003
\`\`\`

5. Start the servers:

Backend:
\`\`\`bash
cd backend
npm start
\`\`\`

Frontend:
\`\`\`bash
cd frontend
npm start
\`\`\`

## Usage

### User Registration
1. Navigate to the signup page
2. Select appropriate role
3. Fill in required information:
   - Full Name
   - Email
   - Password
   - Role-specific fields (School/Department)
4. Wait for admin approval

### Resource Management
1. Login with approved credentials
2. Access role-specific dashboard
3. Manage resources based on permissions:
   - View available resources
   - Request resources
   - Approve/reject requests
   - Transfer resources
   - Track resource history

## API Routes

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/user - Get current user
- PUT /api/auth/profile - Update user profile

### Resource Management
- GET /api/resource - List resources
- POST /api/resource - Create resource
- PUT /api/resource/:id - Update resource
- DELETE /api/resource/:id - Delete resource

### Request Management
- POST /api/resourceRequests - Create request
- GET /api/resourceRequests - List requests
- PUT /api/resourceRequests/:id - Update request status
- GET /api/resourceRequests/history - View request history

### Asset Management
- POST /api/assetAssignments - Assign asset
- GET /api/assetAssignments - List assignments
- PUT /api/assetAssignments/:id - Update assignment
- POST /api/transfers - Create transfer request
- GET /api/transfers - List transfers

### User Management
- GET /api/users - List users (admin only)
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

## Security Features
- JWT-based authentication
- Password hashing
- Role-based access control
- Input validation
- File upload restrictions
- Request validation

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details

