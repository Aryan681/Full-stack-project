# 🌍 AI Study Abroad Assistant: Full-Stack Application

## 🌟 Project Overview

The **AI Study Abroad Assistant** is a secure full-stack web application that provides students with country-specific information about studying abroad in the USA, UK, Canada, and Australia. It functions as a specialized chatbot using **Retrieval-Augmented Generation (RAG)** to ensure answers come **only** from uploaded PDF guides, not general AI knowledge. This README covers both the **Frontend (React/Vite)** and **Backend (Express.js/Node.js)**.

---

## ✨ Core Features

### User Experience (Frontend)

* **Secure Authentication:** Sign-up and log-in with JWT-based sessions.
* **AI Chat Interface:** Ask questions about visas, living costs, universities, etc.
* **Document-Sourced Responses:** Answers come strictly from uploaded guides.
* **Chat History:** View past conversations.
* **Responsive Design:** Works on desktop, tablet, and mobile (Tailwind CSS).

### System Architecture (Backend)

* **RAG Implementation:** Uses an LLM and a Vector Database (Qdrant/AstraDB) for contextual lookups.
* **Document Processing:** Handles PDF uploads with `pdf-parse` and `multer`.
* **Database Management:** Prisma ORM stores users, chat history, and document metadata.
* **Security:** JWT authentication, password hashing, rate limiting with Redis.

---

## 🛠️ Technical Stack

### Frontend

| Category       | Technology   | Packages                                     |
| -------------- | ------------ | -------------------------------------------- |
| Framework      | React (Vite) | `react`, `react-dom`, `@vitejs/plugin-react` |
| Styling        | Tailwind CSS | `tailwindcss`, `@tailwindcss/vite`           |
| Routing        | React Router | `react-router-dom`                           |
| Networking     | Axios        | `axios`                                      |
| Authentication | JWT Decode   | `jwt-decode`                                 |
| UX/Animation   | GSAP, Lenis  | `gsap`, `@studio-freight/lenis`              |

### Backend

| Category  | Technology                        | Packages                                                                    |
| --------- | --------------------------------- | --------------------------------------------------------------------------- |
| Framework | Node.js (Express.js)              | `express`, `nodemon`                                                        |
| Database  | Prisma ORM, PostgreSQL            | `@prisma/client`                                                            |
| AI/LLM    | OpenAI / Gemini                   | `openai`, `@google/generative-ai`                                           |
| Vector DB | Qdrant / AstraDB                  | `@qdrant/js-client-rest`, `@astrajs/client`                                 |
| Security  | JWT, bcrypt, Redis, Rate limiting | `jsonwebtoken`, `bcrypt`, `express-rate-limit`, `rate-limit-redis`, `redis` |
| Utilities | PDF Handling, File Uploads        | `pdf-parse`, `multer`, `dotenv`                                             |

---

## 📂 Project Structure

### Backend (`./back`)

```
./back/
├── controllers/ # Route logic (auth, chat, documents)
├── middlewares/ # JWT auth, rate limiting, upload config
├── routers/ # API routes (auth, chat, docs)
├── prisma/ # Database schema
├── services/ # Core logic (RAG, vector DB)
├── utils/ # Utility functions (Redis connection)
├── server.js # Entry point
└── package.json
```

### Frontend (`./client`)

```
./client/
├── src/
│ ├── base/ # Navbar
│ ├── components/ # Reusable UI components
│ ├── context/ # AuthContext
│ ├── pages/ # Chat, Login, Register pages
│ ├── index.css
│ └── main.jsx
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js (LTS)
* Database (PostgreSQL, Supabase, etc.)
* Vector Database (Qdrant or AstraDB)
* LLM API keys (OpenAI/Gemini)
* Redis instance

### 1. Backend Setup

1. Navigate to backend and install dependencies:

```bash
cd back
npm install
```

2. Create a `.env` file with placeholders:

```
# Database
DATABASE_URL="your_database_connection_pool_url"
DIRECT_URL="your_direct_database_connection_url"

# Authentication
JWT_SECRET="your_jwt_secret_key"

# Redis
REDIS_URL="your_redis_connection_url"

# Gemini / LLM
GEMINI_API_KEY="your_gemini_api_key"

# Qdrant / Vector Database
QDRANT_URL="your_qdrant_instance_url"
QDRANT_API_KEY="your_qdrant_api_key"
QDRANT_COLLECTION="your_qdrant_collection_name"

# Frontend
FRONTEND_URL="http://localhost:5173/"
```

3. Run migrations:

```bash
npx prisma migrate dev --name init
```

4. Start the backend server:

```bash
npm run dev
```

The API will typically run on `http://localhost:5000`.

### 2. Frontend Setup

1. Navigate to frontend and install dependencies:

```bash
cd ../client
npm install
```

2. Create a `.env` file:

```
VITE_API_BASE_URL="http://localhost:5000/api/v1"
```

3. Start the frontend client:

```bash
npm run dev
```

The client will typically run on `http://localhost:5173`.

---

## 💻 Assignment Deliverables

* Publicly accessible app URL
* GitHub repository link
* Short demo video (2-3 minutes)
* Optional: notes explaining Vector Database setup

---

## ✅ Evaluation Criteria

* Accuracy and relevance of AI responses
* Code structure and clarity
* User interface and experience
* Deployment readiness
* Creativity and unique improvements

