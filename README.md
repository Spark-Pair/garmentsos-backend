# GarmentsOS – Backend

🚀 Backend service for **GarmentsOS**, developed by **SparkPair** using **Node.js, Express, and MongoDB**.

---

## 🧠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- REST APIs

---

## 📁 Folder Structure

backend/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── uploads/
├── server.js
├── seeder.js
└── package.json


---

## ⚙️ Environment Variables

Create a `.env` file in root:

```env

# Application Configuration
APP_NAME=GarmentsOS - Article Management System
NODE_ENV=development
PORT=5000

# Company Details
COMPANY_NAME=your_company_name
COMPANY_ADDRESS=your_company_address
COMPANY_PHONE=your_company_phone
COMPANY_EMAIL=your_company_email

# Database
MONGODB_URI=your_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_seceret
JWT_EXPIRE=your_jwt_expire

# Developer Info
POWERED_BY=SparkPair
DEVELOPER_KEY=sparkpair_dev

▶️ Run Project
npm install
npm run dev

or

npm start

🌐 API Base URL
http://localhost:5000/api

🧑‍💻 Developed By
SparkPair https://sparkpair.dev
Custom ERP & Manufacturing Solutions