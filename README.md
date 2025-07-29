# Expense Tracking System

A comprehensive expense tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Category Management**: Create custom categories with icons and colors
- **Dashboard Analytics**: Visual charts and insights for spending patterns
- **Budget Tracking**: Set monthly budgets and track utilization
- **Filtering & Search**: Advanced filtering by date, amount, category, and payment method
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Data Export**: Export expense data for analysis

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management

## Project Structure

```
ExpenseTracking/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── categories.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Create .env file in root directory
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Start the server:
```bash
npm run server
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Full Stack Development

To run both backend and frontend simultaneously:
```bash
npm run dev
```

## API Endpoints

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
- `GET /api/expenses/summary/current-month` - Get monthly summary

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/default/list` - Get default categories
- `POST /api/categories/import-defaults` - Import default categories

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/charts` - Get chart data
- `GET /api/dashboard/insights` - Get spending insights

## Database Schema

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `currency` (String, default: 'USD')
- `monthlyBudget` (Number, default: 0)
- `createdAt` (Date)

### Expense
- `user` (ObjectId, ref: 'User', required)
- `title` (String, required)
- `amount` (Number, required)
- `category` (ObjectId, ref: 'Category', required)
- `description` (String)
- `date` (Date, required)
- `paymentMethod` (String, enum)
- `location` (String)
- `tags` (Array of Strings)
- `isRecurring` (Boolean, default: false)
- `recurringType` (String, enum)
- `attachments` (Array of Objects)

### Category
- `user` (ObjectId, ref: 'User', required)
- `name` (String, required)
- `icon` (String, default: '💰')
- `color` (String, default: '#3B82F6')
- `description` (String)
- `budget` (Number, default: 0)
- `isActive` (Boolean, default: true)

## Features in Detail

### Dashboard
- **Summary Cards**: Total spending, expense count, budget utilization
- **Charts**: Daily spending trend, category breakdown, payment method distribution
- **Recent Expenses**: Latest 5 expenses
- **Top Categories**: Highest spending categories
- **Insights**: AI-powered spending recommendations

### Expense Management
- **Quick Add**: Fast expense entry with minimal fields
- **Detailed Add**: Full expense form with all fields
- **Bulk Operations**: Select multiple expenses for batch operations
- **Recurring Expenses**: Set up automatic recurring expenses
- **Attachments**: Upload receipts and documents

### Categories
- **Custom Categories**: Create personalized categories
- **Default Categories**: Pre-built categories for new users
- **Category Budgets**: Set spending limits per category
- **Visual Customization**: Icons and colors for easy identification

### Analytics
- **Time Periods**: View data by week, month, or year
- **Comparisons**: Compare spending across different periods
- **Export Data**: Download expense reports in various formats
- **Trends**: Identify spending patterns and trends

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet**: Security headers for Express.js
- **Rate Limiting**: Protection against brute force attacks

## Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Set environment variables
3. Deploy using Git

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Get connection string
3. Update environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub. 