# 🚀 Taskify — Project & Task Management Platform

A modern and scalable project management app for teams. Built with **Node.js**, **Express.js**, **MongoDB**, **React**, **TypeScript**, and **Tailwind CSS**.

---

## 🔧 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🧩 Features Overview

### 🔐 Authentication

- Email & Password login
- JWT-based authentication with secure cookie sessions
- Zod-based schema validation
- Email verification system
- Forgot & Reset password flow

### 🏠 Landing Page

- Public landing page with app overview and CTA

### 🏢 Workspace Management

- Create and manage multiple workspaces
- Invite members via email
- Role-based access:
  - Owner
  - Admin
  - Member
  - Viewer

### 📁 Project & Task Management

- Projects with nested subtasks
- Task CRUD (Create, Read, Update, Delete)
- Task statuses: `To Do`, `In Progress`, `Completed`
- Task priorities: `Low`, `Medium`, `High`
- Assign multiple users to tasks
- Watch/unwatch task functionality
- Archive completed or old tasks

### 💬 Collaboration Tools

- Commenting system on tasks
- Activity logs for tracking changes

### 📊 Analytics Dashboard

- Task trends over time
- Project status breakdown (pie chart)
- Task priority distribution
- Workspace productivity charts

### 👤 User Profile

- Edit personal details
- Upload profile picture

### 🛡️ Access Control

- Role-based permissions for tasks and projects:
  - Manager
  - Contributor
  - Viewer

### 🔄 Session Management

- Logout and session termination
- Cookie-based JWT session handling

### 🌱 Developer Utilities

- Seed scripts for test/demo data
- Mongoose transactions for reliable DB operations

### ⚙️ Tools

- React Query for managing server state
- Zod for form & schema validation

---

## 🖥️ Screenshots

| Dashboard                                                        | Task View                                                      | Invite Members                                                     |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| ![Dashboard](https://via.placeholder.com/300x180?text=Dashboard) | ![Task](https://via.placeholder.com/300x180?text=Task+Details) | ![Invite](https://via.placeholder.com/300x180?text=Invite+Members) |

> _(Add actual screenshots from your app in the `/public` or `/assets` folder and update these links)_

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/taskify.git

# 2. Install dependencies
cd taskify
npm install

# 3. Create environment variables
cp .env.example .env

# 4. Run the development server
npm run dev
```
