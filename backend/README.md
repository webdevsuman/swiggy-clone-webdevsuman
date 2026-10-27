# Swiggy Clone Backend API

A production-grade, backend-only food ordering platform built using **Node.js, Express.js, MongoDB, and Mongoose**.

The system features **Role-Based Access Control (RBAC)** across three distinct roles (`Admin`, `Restaurant Owner`, `User`), dual-token JWT authentication (Access & Refresh), Secret-Key authorization for administrative operations, strict multi-stage ownership validation, single-restaurant cart isolation, and real-time MongoDB aggregation metrics.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Architecture & Folder Structure](#architecture--folder-structure)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Security & Authentication](#security--authentication)
5. [Installation & Setup](#installation--setup)
6. [API Endpoints & Payload Documentation](#api-endpoints--payload-documentation)
   - [Health Check](#health-check)
   - [1. Authentication Module (`/api/auth`)](#1-authentication-module-apiauth)
   - [2. Food Category Module (`/api/categories`)](#2-food-category-module-apicategories)
   - [3. Restaurant Management Module (`/api/restaurants`)](#3-restaurant-management-module-apirestaurants)
   - [4. Food Item Management Module (`/api/foods`)](#4-food-item-management-module-apifoods)
   - [5. Cart Management Module (`/api/cart`)](#5-cart-management-module-apicart)
   - [6. Order Management Module (`/api/orders`)](#6-order-management-module-apiorders)
   - [7. Admin Platform Management & Statistics (`/api/admin`)](#7-admin-platform-management--statistics-apiadmin)

---

## Tech Stack
- **Runtime**: Node.js (ES Modules: `"type": "module"`)
- **Web Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Request Validation**: Zod schema validation
- **Image Storage**: Multer & Cloudinary
- **Logging**: Winston logger & Morgan HTTP logger

---

## Architecture & Folder Structure

```
backend/
├── .env
├── .env.example
├── index.js                     # HTTP Server & DB startup
├── package.json
└── src/
    ├── app.js                   # Express application setup & middleware pipeline
    ├── config/
    │   ├── dbConnect.js         # MongoDB connection with DNS fallbacks
    │   └── cloudinary.js        # Cloudinary stream uploader & asset manager
    ├── constants/
    │   ├── constants.js         # Environment mappings & limits
    │   ├── orderStatus.constant.js # Order lifecycle states
    │   ├── regex.js             # Validation regex (passwords, phone, Mongo IDs)
    │   └── roles.constant.js    # ADMIN, RESTAURANT_OWNER, USER
    ├── controllers/
    │   ├── admin.controller.js
    │   ├── auth.controller.js
    │   ├── cart.controller.js
    │   ├── category.controller.js
    │   ├── food.controller.js
    │   ├── order.controller.js
    │   └── restaurant.controller.js
    ├── middlewares/
    │   ├── adminSecret.middleware.js # x-admin-secret-key header validation
    │   ├── auth.middleware.js        # JWT access token & account active guard
    │   ├── role.middleware.js        # RBAC role guards
    │   └── upload.middleware.js      # Multer memory storage & Cloudinary pipeline
    ├── models/
    │   ├── cart.model.js
    │   ├── category.model.js
    │   ├── food.model.js
    │   ├── order.model.js
    │   ├── restaurant.model.js
    │   └── user.model.js
    ├── routes/
    │   ├── admin.routes.js
    │   ├── auth.routes.js
    │   ├── cart.routes.js
    │   ├── category.routes.js
    │   ├── food.routes.js
    │   ├── index.js             # Central aggregator mounted at /api
    │   ├── order.routes.js
    │   └── restaurant.routes.js
    ├── scripts/
    │   └── seedAdmin.js         # Seed Super Admin credentials from .env
    ├── utils/
    │   ├── httpStatusCodes.js   # Standardized HTTP status codes
    │   └── logger.js            # Winston console & file logger
    └── validators/
        ├── admin.validator.js
        ├── auth.validator.js
        ├── cart.validator.js
        ├── category.validator.js
        ├── food.validator.js
        ├── index.js             # Generic Zod validation runner
        ├── order.validator.js
        └── restaurant.validator.js
```

---

## User Roles & Permissions

| Role | Description | Core Capabilities |
| :--- | :--- | :--- |
| **`admin`** | Platform Administrator | Manage categories, view all orders/restaurants, block/unblock users, view platform GMV & analytics. |
| **`restaurant_owner`** | Merchant Partner | Create and update own restaurant, manage menu items, toggle food availability, manage order status (*Accepted ➔ Preparing ➔ Out for Delivery ➔ Delivered*). |
| **`user`** | Ordering Customer | Browse restaurants/menus, search/filter dishes, manage single-restaurant cart, place orders, view order history, cancel orders before preparation. |

---

## Security & Authentication

1. **Dual-Token System**:
   - `accessToken`: Short-lived (1 day), carried in `Authorization: Bearer <token>` header.
   - `refreshToken`: Long-lived (7 days), stored on user document, used to exchange for a fresh access token via `/api/auth/refresh-token`.
2. **Admin Secret Key Protection**:
   - All Admin mutation and analytics endpoints require the custom header:
     `x-admin-secret-key: <ADMIN_SECRET_KEY>`
3. **Multi-Stage Ownership Validation**:
   - Restaurant owners can only update dishes and orders belonging to their own restaurants.
   - Users can only view, modify, and cancel their own carts and orders.
4. **Immediate Deactivation**:
   - When an account is blocked (`isActive: false`), all further authenticated requests are rejected with `HTTP 403 Forbidden`.

---

## Installation & Setup

### 1. Clone & Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Seed Super Admin Account
Creates or updates the primary Admin account defined in `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`:
```bash
npm run seed:admin
```

### 4. Start Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:5000` with nodemon auto-reload.

---

## API Endpoints & Payload Documentation

### Standard Response Envelope
All API responses follow a uniform JSON structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

### Health Check
- **`GET /api/health`**
- **Access**: Public
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Swiggy Clone API is healthy and running",
    "timestamp": "2026-10-27T08:00:00.000Z"
  }
  ```

---

### 1. Authentication Module (`/api/auth`)

#### A. User Registration
- **`POST /api/auth/register`**
- **Access**: Public (Allows `user` and `restaurant_owner` registration)
- **Request Body**:
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul.user@example.com",
    "password": "User@12345",
    "role": "user",
    "phone": "9876543210",
    "address": "Flat 402, Green Valley Apartments, Salt Lake, Kolkata"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "id": "673f1234567890abcdef1234",
      "name": "Rahul Sharma",
      "email": "rahul.user@example.com",
      "role": "user"
    }
  }
  ```

#### B. User Login
- **`POST /api/auth/login`**
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "rahul.user@example.com",
    "password": "User@12345"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "id": "673f1234567890abcdef1234",
      "name": "Rahul Sharma",
      "email": "rahul.user@example.com",
      "role": "user",
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

#### C. Refresh Access Token
- **`POST /api/auth/refresh-token`**
- **Access**: Public
- **Request Body**:
  ```json
  {
    "refreshToken": "<YOUR_REFRESH_TOKEN>"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Access token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOi..."
    }
  }
  ```

#### D. View Current Profile
- **`GET /api/auth/me`**
- **Access**: Authenticated (`user`, `restaurant_owner`, `admin`)
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

#### E. Logout
- **`POST /api/auth/logout`**
- **Access**: Authenticated
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

---

### 2. Food Category Module (`/api/categories`)

#### A. Get All Categories
- **`GET /api/categories`**
- **Access**: Public
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6ae05e34647967a01f14e00c",
        "name": "Biryani",
        "description": "Fragrant dum biryanis",
        "isActive": true
      }
    ]
  }
  ```

#### B. Get Category By ID
- **`GET /api/categories/:id`**
- **Access**: Public

#### C. Create Category
- **`POST /api/categories`**
- **Access**: Admin Only
- **Headers**:
  - `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
  - `x-admin-secret-key: <ADMIN_SECRET_KEY>`
- **Request Body**:
  ```json
  {
    "name": "Mughlai",
    "description": "Rich and aromatic North Indian & Mughlai cuisine"
  }
  ```

#### D. Update Category
- **`PUT /api/categories/:id`**
- **Access**: Admin Only
- **Headers**: Admin Token + `x-admin-secret-key`
- **Request Body**:
  ```json
  {
    "description": "Updated description",
    "isActive": true
  }
  ```

#### E. Delete Category
- **`DELETE /api/categories/:id`**
- **Access**: Admin Only
- **Headers**: Admin Token + `x-admin-secret-key`

---

### 3. Restaurant Management Module (`/api/restaurants`)

#### A. Browse & Search Restaurants
- **`GET /api/restaurants?search=arsalan&cuisine=biryani&city=kolkata&isOpen=true&page=1&limit=10`**
- **Access**: Public
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6ae05edd647967a01f14e00d",
        "name": "Arsalan Grand",
        "description": "The taste of Kolkata",
        "cuisine": ["Biryani", "Mughlai"],
        "address": {
          "street": "191 Park Street",
          "city": "Kolkata",
          "state": "West Bengal",
          "pincode": "700017"
        },
        "contactNumber": "9830112233",
        "isOpen": true,
        "rating": 4.5
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "totalPages": 1,
      "limit": 10
    }
  }
  ```

#### B. Get Single Restaurant Details
- **`GET /api/restaurants/:id`**
- **Access**: Public

#### C. Create Restaurant
- **`POST /api/restaurants`**
- **Access**: Restaurant Owner Only (`role: "restaurant_owner"`)
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Arsalan Grand",
    "description": "The taste of Kolkata",
    "cuisine": ["Biryani", "Mughlai"],
    "address": {
      "street": "191 Park Street",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700017"
    },
    "contactNumber": "9830112233"
  }
  ```

#### D. View My Restaurants
- **`GET /api/restaurants/owner/me`**
- **Access**: Restaurant Owner Only
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`

#### E. Update Restaurant
- **`PUT /api/restaurants/:id`**
- **Access**: Restaurant Owner Only (Enforces Ownership Validation)
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "description": "Newly renovated dining hall"
  }
  ```

#### F. Toggle Restaurant Open/Closed Status
- **`PATCH /api/restaurants/:id/status`**
- **Access**: Restaurant Owner Only (Enforces Ownership Validation)
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`

---

### 4. Food Item Management Module (`/api/foods`)

#### A. Browse & Filter Foods
- **`GET /api/foods?search=biryani&category=<CAT_ID>&restaurant=<REST_ID>&isVeg=false&minPrice=200&maxPrice=500`**
- **Access**: Public

#### B. View Restaurant Menu
- **`GET /api/foods/restaurant/:restaurantId`**
- **Access**: Public

#### C. Get Single Food Details
- **`GET /api/foods/:id`**
- **Access**: Public

#### D. Create Food Item
- **`POST /api/foods`**
- **Access**: Restaurant Owner Only (Must own the referenced restaurant)
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Kolkata Mutton Biryani",
    "description": "Fragrant rice with succulent mutton piece and golden potato",
    "price": 380,
    "category": "6ae05e34647967a01f14e00c",
    "restaurant": "6ae05edd647967a01f14e00d",
    "isVeg": false,
    "isAvailable": true
  }
  ```

#### E. Update Food Item
- **`PUT /api/foods/:id`**
- **Access**: Restaurant Owner Only (Ownership Validation)
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "price": 395
  }
  ```

#### F. Toggle Availability (Sold Out / Available)
- **`PATCH /api/foods/:id/availability`**
- **Access**: Restaurant Owner Only
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`

#### G. Delete Food Item
- **`DELETE /api/foods/:id`**
- **Access**: Restaurant Owner Only
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`

---

### 5. Cart Management Module (`/api/cart`)

#### A. Get Current User Cart
- **`GET /api/cart`**
- **Access**: Customer Only (`role: "user"`)
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673f...",
      "user": "673f...",
      "restaurant": {
        "_id": "6ae05edd647967a01f14e00d",
        "name": "Arsalan Grand",
        "isOpen": true
      },
      "items": [
        {
          "food": {
            "_id": "6ae063d9fddb4dff10b3739d",
            "name": "Kolkata Mutton Biryani",
            "price": 380,
            "isVeg": false
          },
          "quantity": 2,
          "price": 380
        }
      ],
      "totalPrice": 760
    }
  }
  ```

#### B. Add Item to Cart (Single-Restaurant Enforced)
- **`POST /api/cart/add`**
- **Access**: Customer Only
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "foodId": "6ae063d9fddb4dff10b3739d",
    "quantity": 2
  }
  ```

#### C. Update Quantity
- **`PUT /api/cart/update-quantity`**
- **Access**: Customer Only
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`
- **Request Body** *(Setting quantity to 0 auto-removes the item)*:
  ```json
  {
    "foodId": "6ae063d9fddb4dff10b3739d",
    "quantity": 3
  }
  ```

#### D. Remove Specific Item
- **`DELETE /api/cart/items/:foodId`**
- **Access**: Customer Only
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`

#### E. Clear Cart
- **`DELETE /api/cart/clear`**
- **Access**: Customer Only
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`

---

### 6. Order Management Module (`/api/orders`)

#### A. Place Order (Checkout Active Cart)
- **`POST /api/orders`**
- **Access**: Customer Only
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "deliveryAddress": {
      "street": "Flat 402, Block B, Green Valley",
      "city": "Kolkata",
      "state": "West Bengal",
      "pincode": "700064"
    },
    "paymentMethod": "COD"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Order placed successfully",
    "data": {
      "_id": "67401234567890abcdef9999",
      "totalAmount": 760,
      "status": "Pending",
      "paymentMethod": "COD",
      "paymentStatus": "Pending"
    }
  }
  ```

#### B. Customer View Own Orders
- **`GET /api/orders/my-orders`**
- **Access**: Customer Only
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`

#### C. Customer Cancel Order
- **`PUT /api/orders/:id/cancel`**
- **Access**: Customer Only (Allowed only while status is `Pending` or `Accepted`)
- **Headers**: `Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>`
- **Request Body**:
  ```json
  {
    "reason": "Change of plans"
  }
  ```

#### D. Restaurant Owner View Kitchen Orders
- **`GET /api/orders/restaurant-orders?status=Pending`**
- **Access**: Restaurant Owner Only
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`

#### E. Restaurant Owner Advance Order Status
- **`PATCH /api/orders/:id/status`**
- **Access**: Restaurant Owner Only (Enforces Restaurant Ownership)
- **Headers**: `Authorization: Bearer <OWNER_ACCESS_TOKEN>`
- **Allowed Transitions**: `"Accepted"`, `"Preparing"`, `"Out for Delivery"`, `"Delivered"`, `"Cancelled"`
- **Request Body**:
  ```json
  {
    "status": "Preparing"
  }
  ```

#### F. Admin View All Orders
- **`GET /api/orders/admin/all?status=Delivered&page=1&limit=20`**
- **Access**: Admin Only
- **Headers**: Admin Token + `x-admin-secret-key`

#### G. View Single Order By ID
- **`GET /api/orders/:id`**
- **Access**: Authenticated (Allowed for the Customer who ordered, the Restaurant Owner who received it, or an Admin)
- **Headers**: `Authorization: Bearer <TOKEN>`

---

### 7. Admin Platform Management & Statistics (`/api/admin`)

#### A. View Platform Overview & Revenue
- **`GET /api/admin/stats`**
- **Access**: Admin Only
- **Headers**:
  - `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`
  - `x-admin-secret-key: <ADMIN_SECRET_KEY>`
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "users": {
        "total": 12,
        "customers": 9,
        "restaurantOwners": 2,
        "active": 11,
        "blocked": 1
      },
      "restaurants": {
        "total": 3,
        "open": 2,
        "closed": 1
      },
      "catalog": {
        "categories": 5,
        "foods": 18
      },
      "orders": {
        "total": 45,
        "breakdown": {
          "Pending": 2,
          "Accepted": 3,
          "Preparing": 5,
          "Out for Delivery": 4,
          "Delivered": 28,
          "Cancelled": 3
        }
      },
      "financials": {
        "totalRevenue": 24500,
        "currency": "INR"
      }
    }
  }
  ```

#### B. View All Users (Search & Filters)
- **`GET /api/admin/users?role=restaurant_owner&isActive=true&page=1&limit=20`**
- **Access**: Admin Only
- **Headers**: Admin Token + `x-admin-secret-key`

#### C. Block or Unblock a User
- **`PATCH /api/admin/users/:id/status`**
- **Access**: Admin Only (Self-blocking is prevented)
- **Headers**: Admin Token + `x-admin-secret-key`
- **Request Body**:
  ```json
  {
    "isActive": false
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User account has been blocked / deactivated successfully."
  }
  ```

#### D. View All Restaurants Across Platform
- **`GET /api/admin/restaurants?isOpen=true&page=1&limit=20`**
- **Access**: Admin Only
- **Headers**: Admin Token + `x-admin-secret-key`
