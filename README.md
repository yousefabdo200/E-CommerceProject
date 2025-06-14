# 🛒 E-Commerce Project

A full-stack E-Commerce web application built with **Angular** and **Laravel**, featuring user-friendly shopping functionality and a secure admin dashboard for managing products and orders.

---

## 🚀 Tech Stack

- **Frontend:** Angular
- **Backend:** Laravel
- **Database:** MySQL
- **Authentication:** Laravel Sanctum / Passport (via guards: `auth:api`, `auth:admin`)

---

## 👥 User Features

- Register with: email, username, password, gender, image
- Login & logout securely
- View home (promotions) and about page without login
- View products (search, browse)
- Add/remove products from cart
- Checkout to create order
- Manage profile (view/edit info)
- View order history
- Cancel pending orders

---

## 🛡️ Admin Features

- Login & logout securely
- Manage Products:
  - Create, view, update, delete
  - Search by category or name
- Manage Orders:
  - View all orders
  - Accept or reject orders

---

## 🔗 Demo

🎥 [Watch Demo](https://drive.google.com/file/d/1AGgs5N2IuJ45bXM75SHo5QG_hAo3Y7_w/view?usp=sharing)

---

## 🔧 API Overview

### 🔑 Authentication

| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | /admin/login      | Admin login         |
| GET    | /admin/logout     | Admin logout        |
| POST   | /user/signup      | User registration   |
| POST   | /user/login       | User login          |
| POST   | /user/logout      | User logout         |

---

### 📦 Products

#### Public

| Method | Endpoint                   | Description                     |
|--------|----------------------------|---------------------------------|
| GET    | /all/product/category      | Get all product categories      |
| GET    | /all/product/{category?}   | Get all products (filter optional) |

#### Admin (Requires `auth:admin`)

| Method | Endpoint                 | Description          |
|--------|--------------------------|----------------------|
| POST   | /admin/product           | Create product       |
| GET    | /admin/product/{id}      | Get single product   |
| PUT    | /admin/product/{id}      | Update product       |
| DELETE | /admin/product/{id}      | Delete product       |

#### User (Requires `auth:api`)

| Method | Endpoint       | Description         |
|--------|----------------|---------------------|
| GET    | /user/product  | Get all products    |

---

### 🛒 Cart (User only)

| Method  | Endpoint                         | Description                      |
|---------|----------------------------------|----------------------------------|
| GET     | /user/cart                       | View cart                        |
| POST    | /user/cart                       | Add product to cart              |
| PUT     | /user/cart/{product_id}          | Decrease item quantity           |
| DELETE  | /user/cart/{product_id}          | Remove product from cart         |
| DELETE  | /user/cart                       | Clear entire cart                |

---

### 📑 Orders

#### Admin

| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| GET    | /admin/order                 | View all orders      |
| GET    | /admin/order/{id}           | View single order    |
| PUT    | /admin/order/{id}/accept    | Accept order         |
| PUT    | /admin/order/{id}/reject    | Reject order         |

#### User

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /user/order               | View user orders     |
| POST   | /user/order               | Create new order     |
| GET    | /user/order/{id}         | View specific order  |

---

## 📝 Setup Instructions

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
