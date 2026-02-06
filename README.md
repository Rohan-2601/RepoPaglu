#  RepoPaglu

> **The Ultimate AI-Powered Developer Tool Suite.**
> Generate READMEs, API Documentation, and analyze Tech Stacks with the power of Groq Llama AI.

![alt text](Screenshot%202026-02-06%20170707.png)

![alt text](Screenshot%202026-02-06%20170739.png)


[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Monorepo](https://img.shields.io/badge/Monorepo-Enabled-purple)](https://github.com/lerna/lerna)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_16-black)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Express.js-green)](https://expressjs.com/)

---

## 📖 Introduction

**RepoPaglu** is a modern, full-stack monorepo application designed to streamline developer workflows using advanced AI. By leveraging **Groq's Llama AI**, RepoPaglu provides a suite of tools to automate tedious documentation tasks and provide deep insights into codebases.

Whether you need a professional README in seconds, comprehensive API documentation, or a breakdown of a project's technology stack, RepoPaglu delivers it through a sleek, responsive interface.

## ✨ Key Features

### 🤖 AI-Powered Generators
- **README Generator** (`/readme`): transform codebase details into professional, OSS-standard `README.md` files.
- **API Documentation** (`/docs`): Automatically generate structured API docs from your route definitions.
- **Code Generation** (`/generate`):  generate jest test cases for your code.

### 🔍 Analysis Tools
- **Tech Stack Analyzer** (`/tech`): Detect languages, frameworks, and libraries used in any repository.

### 🛡️ Robust Backend
- **Secure Authentication**: JWT-based user session management.
- **Rate Limiting**: Built-in protection against abuse (via `express-rate-limit`).
- **High Performance**: Optimized Express.js server handling JSON payloads up to 20MB.

## 🛠️ Tech Stack

### **Frontend Workspace** (`web`)
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: Radix UI (accessible primitives)
- **State/Effects**: Framer Motion (animations)

### **Backend Workspace** (`server`)
- **Runtime**: Node.js
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: MongoDB (via Mongoose)
- **AI Engine**: Groq Llama AI
- **Utilities**: `adm-zip` (file handling), `simple-git` (repo info)

---

## 📂 Repository Structure

This project is a **Monorepo** managed with npm workspaces.

```
RepoPaglu/
├── package.json        # Root workspace configuration
├── README.md           # Project documentation
├── web/                # Frontend application (Next.js)
│   ├── src/app/        # App Router pages ((app), dashboard, auth, etc.)
│   └── package.json    # RepoPaglu-frontend config
└── server/             # Backend API (Express)
    ├── src/            # Server entry and app setup
    ├── routes/         # API Route definitions
    └── package.json    # RepoPaglu-backend config
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MongoDB** instance (local or Atlas)

### 1. Installation

Clone the repository and install dependencies for all workspaces from the root:

```bash
git clone https://github.com/Rohan-2601/RepoPaglu.git
cd RepoPaglu
npm install
```

### 2. Environment Setup

Create `.env` files in both `web` and `server` directories.

**Backend (`server/.env`):**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/repopaglu
JWT_SECRET=your_super_secret_key
GROQ_API_KEY=your_groq_api_key
```

**Frontend (`web/.env`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Running the Project

You can run both the frontend and backend from the root directory using the provided workspace scripts.

**Start Frontend (Development):**
```bash
npm run dev:web
```
*Access at: `http://localhost:3000`*

**Start Backend (Development):**
```bash
npm run dev:server
```
*Access at: `http://localhost:5000`*

---

## 🤝 Contributing

We welcome contributions! Please check the [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to submit issues and pull requests.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **ISC License**. See [LICENSE](./LICENSE) for more information.
