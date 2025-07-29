# Expense Tracking System Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Database Setup

Make sure MongoDB is running on your system. If you don't have MongoDB installed:

- **Windows**: Download and install from [MongoDB website](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow the [official installation guide](https://docs.mongodb.com/manual/installation/)

### 4. Start the Application

```bash
# Start both backend and frontend (recommended)
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features Available

### Backend (Complete)
- ✅ User authentication (register/login)
- ✅ JWT token-based security
- ✅ Expense CRUD operations
- ✅ Category management
- ✅ Dashboard analytics
- ✅ Input validation
- ✅ Error handling

### Frontend (Basic Structure)
- ✅ Authentication pages (Login/Register)
- ✅ Dashboard with summary cards
- ✅ Navigation and routing
- ✅ Responsive design
- ✅ Form validation
- ⏳ Expense management (coming soon)
- ⏳ Category management (coming soon)
- ⏳ Profile management (coming soon)

## Next Steps

1. **Complete Frontend Pages**: Implement the remaining pages (Expenses, Categories, Profile)
2. **Add Charts**: Integrate Chart.js for data visualization
3. **Add Forms**: Create expense and category forms
4. **Add Modals**: Implement edit/delete modals
5. **Add Search/Filter**: Implement expense filtering
6. **Add Export**: Implement data export functionality

## API Endpoints

The backend provides these endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Expenses
- `GET /api/expenses` - Get all expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/charts` - Get chart data
- `GET /api/dashboard/insights` - Get spending insights

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Make sure MongoDB is running
   - Check the connection string in `.env`
   - Try `mongodb://127.0.0.1:27017/expense-tracker` instead of `localhost`

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill processes using the port: `lsof -ti:5000 | xargs kill -9`

3. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check for missing dependencies

4. **CORS Errors**
   - The backend is configured to allow requests from `http://localhost:3000`
   - If using a different port, update the CORS configuration in `backend/server.js`

## Development Tips

1. **Use the dev script**: `npm run dev` starts both servers simultaneously
2. **Check the console**: Both frontend and backend have detailed error logging
3. **Use Postman/Insomnia**: Test API endpoints directly
4. **MongoDB Compass**: Use for database visualization and debugging

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Set a strong JWT_SECRET
4. Configure proper CORS settings
5. Set up environment variables on your hosting platform
6. Build the frontend: `cd frontend && npm run build`
7. Serve the build folder with your backend or a static file server 