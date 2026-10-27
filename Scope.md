# Section 3 – Build a Swiggy Clone Backend with Role-Based Order Management System

**(50 × 1 = 50 Marks)**

The system is a backend-only food ordering platform built using **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

The platform supports three user roles:
- **Admin**
- **Restaurant Owner**
- **User**

The backend must provide secure authentication using **JWT Access Token** and **Refresh Token**, along with **Role-Based Access Control**, **Secret-Key Authorization**, and **Ownership Validation**.

---

## Project Objectives

The student needs to implement:

- [ ] JWT-based Authentication
- [ ] Access Token & Refresh Token
- [ ] Password Hashing using `bcryptjs`
- [ ] Role-Based Access Control
- [ ] Restaurant Management
- [ ] Food Item Management
- [ ] Food Category Management
- [ ] Cart Management
- [ ] Order Management
- [ ] Search & Filter
- [ ] Ownership Validation
- [ ] Basic Admin Management
- [ ] Request Validation & Error Handling

---

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Joi / Yup / Zod
- Multer / Cloudinary (optional)
- dotenv

---

## User Roles

### Admin
**Admin can:**
- View all users
- Block/Unblock users
- View all restaurants
- View all orders
- Manage food categories
- View basic platform statistics

*Admin APIs must be protected using:*
- Admin JWT Token
- Secret Key

### Restaurant Owner
**Restaurant Owners can:**
- Create a restaurant
- Update their restaurant
- Add food items
- Edit food items
- Delete food items
- View their restaurant orders
- Accept/Reject orders
- Update order status

*Order status flow:*
- Accepted
- Preparing
- Out for Delivery
- Delivered

> **Note:** Owners must not be able to access another restaurant owner's data.

### User
**Users can:**
- Register/Login
- Browse restaurants
- Search food
- Filter food
- View categories
- Add food to cart
- Update cart quantity
- Remove cart items
- Place orders
- View own orders
- Cancel own orders

> **Note:** Users cannot manage restaurants, food items, or order status.

---

## Authentication

Implement:
- User Registration
- User Login
- JWT Access Token
- JWT Refresh Token
- Logout
- Protected Routes
- Password Hashing
- Role-Based Middleware

*The backend should verify the JWT before accessing protected resources.*

---

## Restaurant & Food Management

### Restaurant
Restaurant Owners should be able to:
- Create restaurant
- Update restaurant
- View restaurant
- Manage restaurant status

### Food
Restaurant Owners should be able to:
- Add food
- Update food
- Delete food
- Manage food availability

*Food should be associated with:*
- Restaurant
- Category

### Category Management
**Admin can:**
- Create category
- Update category
- Delete category

**Users and Restaurant Owners can:**
- View categories

---

## Search & Filter

Implement basic search and filtering for:
- Restaurant Name
- Food Name
- Category
- Veg/Non-Veg
- Price

---

## Cart Management

Users should be able to:
- Add food to cart
- Increase/Decrease quantity
- Remove food
- View cart
- Clear cart
- Calculate total price

*The cart must belong to the authenticated user.*

---

## Order Management

Implement a single Order endpoint/system to handle:
- Create Order
- View Orders
- Update Order Status
- Cancel Order

### User
- Create orders
- View own orders
- Cancel own orders

### Restaurant Owner
- View their restaurant orders
- Accept/Reject orders
- Update order status

### Admin
- View all orders
- Manage orders

---

### Ownership & Access Validation
The backend must validate:
- User ownership
- Restaurant ownership
- User role

---

## Basic Admin Management

Admin should be able to:
- View users
- Block/Unblock users
- View restaurants
- View orders
- Manage categories
- View basic order/revenue statistics

---

## Validation & Security

Implement:
- Request validation
- JWT verification
- Role validation
- Ownership validation
- Password hashing
- Proper HTTP status codes
- Centralized error handling
- Environment variables