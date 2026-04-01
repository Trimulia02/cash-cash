# 💳 Cash-Cash: E-Wallet Application

A simple yet complete e-wallet application built with **Node.js**, **Express**, and **PostgreSQL**. Users can register, login, transfer money to others, pay merchants, and view transaction history.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Setup & Installation](#setup--installation)
- [How to Use](#how-to-use)
- [Features Guide](#features-guide)
- [Database Schema](#database-schema)
- [Important Notes](#important-notes)

---

## ✨ Features

### User Management

- ✅ **Register**: Create new account with name, email, password, and phone
- ✅ **Login**: Secure login with email/password
- ✅ **Profile**: View account details and wallet balance

### Wallet Operations

- ✅ **View Balance**: Check current wallet balance on dashboard
- ✅ **View Transactions**: Full transaction history with pagination
- ✅ **Transfer Money**: Send money to other registered users (minimum Rp 1.000)
- ✅ **Pay Merchants**: Purchase from registered merchants
- ✅ **Search Transactions**: Filter transactions by date, type, and amount

### Security Features

- 🔐 **Password Hashing**: Using bcryptjs for secure passwords
- 🔐 **Session Management**: HTTP-only cookies with CSRF protection
- 🔐 **Protected Routes**: Only authenticated users can access dashboard
- ✅ **Input Validation**: All form inputs validated before processing

---

## 🛠 Tech Stack

```
Frontend:
  - EJS (Templating)
  - Tailwind CSS (Styling)

Backend:
  - Node.js 18+
  - Express 5.2.1
  - Sequelize 6.37.8 (ORM)

Database:
  - PostgreSQL

Authentication:
  - express-session
  - bcryptjs
  - Custom middleware
```

---

## 📁 Project Structure

```
cash-cash/
├── app.js                    # Main application entry
├── package.json              # Dependencies
├── config/
│   └── config.json          # Database configuration
├── controllers/
│   └── controller.js        # Request handlers (simplified MVC)
├── models/
│   ├── index.js             # Sequelize initialization
│   ├── user.js              # User model
│   ├── wallet.js            # Wallet model
│   ├── transaction.js        # Transaction model
│   ├── transfer.js          # Transfer model
│   ├── merchant.js          # Merchant model
│   └── payment.js           # Payment model
├── routes/
│   ├── index.js             # Route aggregator
│   ├── publicRoutes.js      # Public pages (home, login, register)
│   ├── protectedRoutes.js   # Protected pages (dashboard, transfers, etc.)
│   └── apiRoutes.js         # API endpoints
├── src/
│   ├── services/            # Business logic layer
│   │   ├── authService.js       # Auth & user logic
│   │   ├── walletService.js     # Wallet & transaction logic
│   │   ├── transferService.js   # P2P transfer logic
│   │   ├── paymentService.js    # Merchant payment logic
│   │   └── merchantService.js   # Merchant data logic
│   └── validators/
│       └── inputValidator.js    # Input validation functions
├── helpers/
│   ├── authMiddleware.js    # Authentication & authorization
│   ├── errorHandler.js      # Centralized error handling
│   ├── currencyFormat.js    # Currency formatting utilities
│   ├── paginationHelper.js  # Pagination logic
│   └── responseHelper.js    # Standardized response formatting
├── migrations/              # Database schema creation
│   └── *.js                # Sequential database migrations
├── seeders/                 # Sample data
│   └── *.js                # Seed scripts for development
├── views/                   # EJS templates
│   ├── dashboard.ejs        # Main dashboard
│   ├── transactions.ejs     # Transaction history page
│   ├── transfers.ejs        # Transfer form & history
│   ├── merchants.ejs        # Merchant listing & payment
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   ├── home.ejs             # Landing page
│   └── layouts/             # Shared components (navbar, footer, etc.)
└── public/                  # Static assets
    └── styles/              # CSS files
```

---

## 🔄 How It Works

### Application Flow

```
User visits app.js (port 3000)
           ↓
    [Session Middleware]
           ↓
    [Make user data available in templates]
           ↓
    [Route Matching]
           ↓
    ├─ Public Routes (/, /login, /register)
    │
    ├─ Protected Routes (requires authentication)
    │  ├─ /dashboard → getDashboard → AuthService.getUserProfile
    │  ├─ /transfers → getTransfers → TransferService
    │  ├─ /merchants → getMerchants → MerchantService
    │  └─ /transactions → getTransactions → WalletService
    │
    └─ API Routes (/api/...)
           ↓
    [Controller processes request]
           ↓
    [Service layer handles business logic]
           ↓
    [Models execute database queries]
           ↓
    [Response sent back + rendered in EJS template]
```

### Architecture: MVC + Service Layer

```
REQUEST
   ↓
[Routes] Match URL to handler
   ↓
[Controller] Parse request, call services
   ↓
[Services] Business logic (validation, calculations)
   ↓
[Models] Database queries via Sequelize
   ↓
[PostgreSQL] Data storage
   ↓
RESPONSE (JSON or rendered EJS template)
```

### Key Operations

#### 1. **User Registration Flow**

```
User fills register form
         ↓
Controller.addRegister()
         ↓
InputValidator.validateRegistration()
         ↓
AuthService.registerUser()
  - Hash password with bcryptjs
  - Create user in database
         ↓
Wallet.create() - Create wallet with initial balance (Rp 100.000)
         ↓
Redirect to login page
```

#### 2. **User Login Flow**

```
User submits email/password
         ↓
Controller.addLogin()
         ↓
AuthService.loginUser()
  - Find user by email
  - Compare password with hash
  - Check if account is active
         ↓
req.session.userId = userId
[Session cookie created, stored in browser]
         ↓
Redirect to /dashboard
```

#### 3. **Money Transfer Flow**

```
User enters recipient username & amount
         ↓
InputValidator.validateTransfer()
  - Check amount >= Rp 1.000
  - Check recipient exists
  - Check balance sufficient
         ↓
TransferService.createTransfer()
  - Find sender & receiver wallets
  - Deduct from sender wallet
  - Add to receiver wallet
  - Create transfer record
  - Create 2 transaction records (debit for sender, credit for receiver)
         ↓
Dashboard updated with new balance
```

#### 4. **Dashboard View Flow**

```
User visits /dashboard
         ↓
authMiddleware checks session.userId
         ↓
Controller.getDashboard()
         ↓
AuthService.getUserProfile()
  - Fetch user data
  - Include wallet (balance)
  - Include wallet.transactions (latest 5)
         ↓
Render dashboard.ejs with user data
  - Show wallet balance
  - Show recent transactions
  - Show action buttons
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Git (optional)

### Step 1: Clone or Extract Project

```bash
cd cash-cash
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment Variables

Create `.env` file in root directory:

```env
# Database Configuration
DB_NAME=cash_cash
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Server
PORT=3000
NODE_ENV=development

# Session
SESSION_SECRET=your-secret-key-change-in-production
```

### Step 4: Create Database

```bash
# Using PostgreSQL
createdb cash_cash
```

### Step 5: Run Migrations

```bash
npx sequelize-cli db:migrate
```

This creates all tables:

- users
- wallets
- transactions
- transfers
- merchants
- payments

### Step 6: Seed Sample Data (Optional)

```bash
npx sequelize-cli db:seed:all
```

This adds:

- 3 sample users (password: password123)
- 5 sample merchants

### Step 7: Start Application

```bash
npm start
```

App will be running on `http://localhost:3000` ✓

---

## 📖 How to Use

### First Time Users

#### 🔐 Creating Account

1. Go to `http://localhost:3000`
2. Click **"Register"**
3. Fill in:
   - **Name**: Your full name
   - **Email**: Unique email for login
   - **Password**: Strong password (min 6 chars)
   - **Confirm Password**: Must match password
   - **Phone**: Valid phone number
4. Click **"Register"**
5. Go to **"Login"** page
6. Enter your email and password

#### 💰 Dashboard

After login, you'll see:

- **Wallet Balance**: Your current money
- **Recent Transactions**: Last 5 activities
- **Quick Action Buttons**:
  - Transfer Money
  - Pay Merchant
  - View History

### Common Actions

#### 💸 Transfer Money to Friend

1. Click **"Transfer Money"** button
2. Select recipient from dropdown
3. Enter amount (minimum Rp 1.000)
4. Click **"Send Transfer"**
5. Money transferred instantly!
6. Check dashboard balance decreased

#### 🛍️ Pay Merchant

1. Click **"Pay Merchant"**
2. Select merchant from list
3. Search by name (optional)
4. Enter payment amount
5. Click **"Pay Now"**
6. Transaction appears in history

#### 📋 View All Transactions

1. Click **"View History"** or go to **/transactions**
2. See all transfers and payments
3. Transactions sorted by newest first
4. Pagination: View 10 per page
5. Filter by transaction type or search

#### 👤 View Account

1. Click on your name (top right navbar)
2. View profile details
3. Click **"Logout"** to exit

---

## 🗄️ Database Schema

### Users Table

```
id (PK)           | Auto-increment unique ID
name              | User's full name
email             | Unique email for login
password          | Hashed password (bcryptjs)
phone             | Phone number
role              | 'user' or 'admin' (default: 'user')
isActive          | true/false (default: true)
createdAt         | Timestamp created
updatedAt         | Timestamp updated
```

### Wallets Table

```
id (PK)           | Auto-increment unique ID
userId (FK)       | References users.id
balance           | Current balance in Rupiah
createdAt         | Timestamp created
updatedAt         | Timestamp updated
```

### Transactions Table

```
id (PK)           | Auto-increment unique ID
walletId (FK)     | References wallets.id
amount            | Transaction amount
type              | 'debit' or 'credit'
description       | Transaction description (transfer, payment, etc.)
direction         | Direction of transaction (send to X, receive from Y)
createdAt         | Timestamp created
updatedAt         | Timestamp updated
```

### Transfers Table

```
id (PK)           | Auto-increment unique ID
senderId (FK)     | References users.id (who sends money)
receiverId (FK)   | References users.id (who receives money)
amount            | Transfer amount
createdAt         | Timestamp created
updatedAt         | Timestamp updated
```

### Merchants Table

```
id (PK)           | Auto-increment unique ID
name              | Merchant name
category          | Business category (food, tech, fashion, etc.)
logo              | Logo/image URL (optional)
isActive          | true/false (default: true)
createdAt         | Timestamp created
updatedAt         | Timestamp updated
```

### Payments Table

```
id (PK)           | Auto-increment unique ID
userId (FK)       | References users.id (who pays)
merchantId (FK)   | References merchants.id
amount            | Payment amount
status            | 'completed', 'pending', 'failed'
createdAt         | Timestamp created
updatedAt         | Timestamp updated
```

---

## 🤔 Important Notes

### Security

- ✅ Passwords hashed with bcryptjs (salt rounds: 10)
- ✅ Sessions expire in 30 days
- ✅ CSRF protection enabled (sameSite: "strict")
- ✅ All inputs validated before database
- ⚠️ In production: Use `connect-pg-simple` for session storage instead of memory

### Minimum Transfer Amount

- Minimum transfer: **Rp 1.000**
- Maximum: No limit (but must have sufficient balance)

### Password Requirements

- Minimum 6 characters
- Must contain at least 1 lowercase letter
- Must contain at least 1 uppercase letter
- Must contain at least 1 number

### Wallet Balance

- Initial balance on registration: **Rp 100.000**
- All transactions immediately update balance
- Cannot transfer if insufficient balance

### Transaction History

- Dashboard shows latest 5 transactions
- Full history on /transactions page
- Paginated: 10 per page
- Sorted: Newest first

### Sample Login Credentials (if seeded)

```
Email: user1@email.com
Password: password123

Email: user2@email.com
Password: password123

Email: user3@email.com
Password: password123
```

---

## 🆘 Troubleshooting

### "Database connection error"

- Check PostgreSQL is running
- Verify DB_NAME, DB_USER, DB_PASSWORD in .env
- Run migrations: `npx sequelize-cli db:migrate`

### "Cannot find module"

- Run: `npm install`
- Check all dependencies in package.json are installed

### "Balance not updating after transfer"

- Check transaction was successful (no error message)
- Refresh dashboard page
- Check walletService.js has balance update logic

### "Session lost after refresh"

- In development, sessions stored in memory (lost on app restart)
- Use connect-pg-simple for production

### "Can't login - Invalid email or password"

- Check email matches registered email (case-sensitive)
- Verify you registered account first (go to /register)
- Check capslock is off
- Confirm account isActive = true in database

---

## 📚 Code Walkthrough Examples

### Example 1: How Transfer Works

```javascript
// File: src/services/transferService.js
static async createTransfer(senderId, receiverId, amount) {
  // Step 1: Validate input
  if (amount < 1000) throw new Error("Minimum transfer is Rp 1.000");
  if (senderId === receiverId) throw new Error("Cannot transfer to yourself");

  // Step 2: Find sender & receiver
  const sender = await User.findByPk(senderId);
  const receiver = await User.findByPk(receiverId);
  if (!sender || !receiver) throw new Error("User not found");

  // Step 3: Get sender's wallet & check balance
  const senderWallet = await Wallet.findOne({ where: { userId: senderId } });
  if (senderWallet.balance < amount) throw new Error("Insufficient balance");

  // Step 4: Create transfer record
  const transfer = await Transfer.create({
    senderId,
    receiverId,
    amount,
  });

  // Step 5: Update balances
  senderWallet.balance -= amount;
  await senderWallet.save();

  const receiverWallet = await Wallet.findOne({ where: { userId: receiverId } });
  receiverWallet.balance += amount;
  await receiverWallet.save();

  // Step 6: Create transaction records
  await Transaction.create({
    walletId: senderWallet.id,
    amount,
    type: "debit",
    description: `Transfer to ${receiver.name}`,
    direction: `Send to ${receiver.name}`,
  });

  await Transaction.create({
    walletId: receiverWallet.id,
    amount,
    type: "credit",
    description: `Transfer from ${sender.name}`,
    direction: `Receive from ${sender.name}`,
  });

  return transfer;
}
```

### Example 2: How Dashboard Fetches Data

```javascript
// File: controllers/controller.js
static async getDashboard(req, res) {
  try {
    // Get full user profile with wallet & latest transactions
    const user = await AuthService.getUserProfile(req.session.userId);

    // Render dashboard template with user data
    res.render("dashboard", { user });
  } catch (error) {
    res.render("dashboard", { error: error.message });
  }
}
```

### Example 3: How Login Works

```javascript
// File: src/services/authService.js
static async loginUser(email, password) {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  // Verify password hash
  const isValid = await user.validatePassword(password);
  if (!isValid) throw new Error("Invalid email or password");

  // Check if account active
  if (!user.isActive) throw new Error("Account is inactive");

  // Return user data (no password!)
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
```

---

## 🎓 Learning Points

This project demonstrates:

1. ✅ Full CRUD operations with Sequelize ORM
2. ✅ User authentication & session management
3. ✅ Service layer architecture (separation of concerns)
4. ✅ Input validation & error handling
5. ✅ Password hashing with bcryptjs
6. ✅ Database relationships (foreign keys, associations)
7. ✅ Pagination & sorting data
8. ✅ EJS templating with dynamic content
9. ✅ Middleware patterns (authentication, error handling)
10. ✅ RESTful route design

---

## 🚀 Next Steps

Want to improve the project? Try:

- [ ] Add rate limiting for transfers
- [ ] Email notifications on successful transaction
- [ ] Admin dashboard to view all users & transactions
- [ ] Two-factor authentication (2FA)
- [ ] QR code for transfer
- [ ] Transaction PDF receipt
- [ ] API documentation (Swagger)
- [ ] Unit tests with Jest
- [ ] Docker containerization

---

## 📞 Support

If you have questions or issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [How It Works](#-how-it-works) section
3. Check database migrations are up-to-date: `npx sequelize-cli db:migrate`
4. Verify .env file has correct database credentials

---

**Happy Coding! 🎉**

_Last updated: April 2, 2026_
