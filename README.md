# 🚀 ProjectGrid Management Application

A **cloud-based Project & Task Management platform** built with the **MERN Stack** (MongoDB, Express, React, Node.js) and modern tooling for scalable, secure, and user-friendly collaboration.

---

## ✨ Features

### 🌐 General

- **Fully responsive design** – optimized for desktop, tablet, and mobile
- **Modern Homepage** with introduction, features, and entry point to the application

### 🔐 Authentication & Security

- **JWT-based Authentication & Authorization** for session management
- **Email Verification** (via SendGrid)
- **Two-Factor Authentication (2FA)** with **OTP (One-Time Password)**
- **OTP expiry timer** for secure, time-limited login sessions
- **Forgot & Reset Password** functionality
- **Zod validation** for robust input handling
- **Secure role-based access control** for Workspaces & Projects

### 👥 Workspaces & Collaboration

- Create **Workspaces** and invite members via **email or link**
- Assign **roles** (Member, Admin, viewer)
- Manage **workspace settings** (transfer ownership, delete workspace, etc.) in **Settings** page

- View **all members** with search & filter functionality

### 📂 Projects & Tasks

- Create and manage **Projects** under Workspaces
- Add **Tasks** with the following capabilities:
  - **Subtasks**
  - **Comments**
  - **Watchers**
  - **Archive / Unarchive**
  - **Delete tasks**
- **Role-based permissions** for managing Projects & Tasks
- Manage **project settings** (Update name, proirity and delete project, etc.) in **Settings** page

### 📜 Activity Log

- View **all activity history** within a workspace
- Track **task creation, updates, deletions, comments, watchers, and archive actions**
- Provides a **transparent audit trail** for better collaboration

### 📊 Dashboard & Insights

- **Visual analytics** with:
  - Line charts
  - Pie charts
  - Bar charts
- **Recent & upcoming projects overview**

### ✅ My Tasks

- View all **assigned tasks**
- **Filter**, **Pagination** and **search** functionality
- **List view** and **Board view** for tasks

### 🗂 Archive

- View all archived tasks
- Search, filter, and **restore (unarchive)** tasks

### 🙍 Profile Management

- Update **profile details** (name, avatar, etc.)
- Enable / disable **2FA Auth login**
- Update **password**

---

## 🛠️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![SendGrid](https://img.shields.io/badge/SendGrid-0085CA?style=for-the-badge&logo=sendgrid&logoColor=white)

### Security & Validation

![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)

---

## 🚀 Deployment & Cloud Setup

- **Frontend** → Vercel (auto-deployment from GitHub)
- **Backend** → Render (scalable cloud hosting)
- Fully integrated for **production-ready** workflows

---

## ⚡ Getting Started & Collaboration

### Run Locally

```bash

1. Clone the repository:

git clone https://github.com/kaziragib18/ProjectGrid-MERN-Stack-Project-Management-App.git

2. Navigate into the project:

cd ProjectGrid-MERN-Stack-Project-Management-App

3. Install dependencies in both backend and froentend folder:

npm install

4. Set up environment variables using .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SEND_GRID_API_KEY=your_sendgrid_api_key
FRONTEND_URL=http://localhost:5173
PORT=5000
ARCJET_KEY=Your_key
FROM_EMAIL=Registered_email

5. Run the development server:

npm run dev

```

---

### Collaboration

Feel free to fork the repository and create a feature branch for contributions.

Submit a pull request for review.

Add issues for bugs or feature requests.

## ⭐ If you like this project, don’t forget to give it a star on GitHub!
