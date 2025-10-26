

```
# ✈️ AI Study Abroad Assistant: Frontend Client

## 🌟 Project Overview

This repository contains the frontend client for the **AI Study Abroad Assistant**, a full-stack web application designed to help students access accurate, country-specific information about studying abroad in the USA, UK, Canada, and Australia.

The core functionality of this application is a secure, intelligent chatbot that provides answers **strictly sourced** from pre-uploaded PDF documents (a Retrieval-Augmented Generation or RAG approach), ensuring accuracy and preventing reliance on general AI knowledge.

This client is built using **React** and **Vite** and is designed to communicate with a separate **FastAPI** backend that handles the AI processing, database operations, and document storage.

---

## ✨ Features

The client application provides the full user interface and experience, including:

* **Secure Authentication:** Dedicated pages for user sign-up (`/register`) and log-in (`/login`) with JWT-based authentication.
* **AI Chat Interface:** The central application page (`/chat`) where users can submit questions and receive Al-powered responses instantly.
* **Contextual Responses:** Chat responses are displayed with a clear indication that they are sourced strictly from the provided study-abroad guide documents.
* **Chat History:** Stores and displays past conversations for user reference.
* **Responsive Design:** Fully responsive layout using Tailwind CSS, ensuring a clean and modern experience across desktop, tablet, and mobile devices.
* **Smooth UX:** Utilizes `gsap` and `@studio-freight/lenis` for smooth scrolling and engaging visual transitions.

---

## 🛠️ Technical Stack (Frontend)

The frontend is bootstrapped with **Vite** and uses a modern, component-based architecture.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React (with Vite) | Building the user interface. |
| **Styling** | Tailwind CSS | Utility-first CSS framework for rapid styling. |
| **Routing** | `react-router-dom` v6 | Handling client-side navigation between pages. |
| **API** | `axios` | HTTP client for making requests to the FastAPI backend. |
| **Auth** | `jwt-decode` | Decoding the JWT token received upon login. |
| **State** | React Context | Global state management (e.g., `AuthContext`). |
| **Animation** | `gsap`, Lenis | Enhancing the user experience with smooth scrolling and animations. |

---

## 📂 File Structure

The project follows a standard React application structure:

```

./client/src/

├── assets/ # Static files, images, icons

├── base/

│ └── Navbar.jsx # Primary navigation component

├── components/ # Reusable UI components (e.g., ChatMessage, Loader, etc.)

├── context/

│ └── AuthContext.jsx # Context API for user authentication and global state

├── index.css # Global styles and Tailwind imports

├── main.jsx # Application entry point

└── pages/ # Route-specific views

├── Chat.jsx # The main AI assistant interface

├── Contact.jsx # Auxiliary page (optional, based on structure)

├── Login.jsx # User login view

└── Register.jsx # New user sign-up view

```

---

## 🚀 Getting Started

These instructions will get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (LTS version recommended)
* npm or yarn (npm is used in the examples)
* The corresponding **FastAPI Backend** running and accessible.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPO_URL]
    cd [YOUR_REPO_NAME]/client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `./client` directory to point to your running backend API.

    ***.env***
    ```
    # Replace with the actual URL of your FastAPI backend
    VITE_API_BASE_URL=http://localhost:8000/api/v1
    ```

### Running the Application

Use the provided scripts from the `package.json` to start the development server:

```bash
# Starts the development server on http://localhost:5173 (or a free port)
npm run dev

```

### Building for Production

To create an optimized production build:

Bash

```
# Creates a production-ready build in the 'dist' folder
npm run build

```

* * * * *

🔗 Backend Requirements
-----------------------

This frontend client requires a fully functional backend API to operate. The backend must provide the following core endpoints:

1.  **`/register`**: User registration.

2.  **`/login`**: User authentication and JWT issuance.

3.  **`/chat/history`**: Retrieving the user's past chat history.

4.  **`/chat/query`**: The main endpoint for sending user questions and receiving RAG-powered responses.

The backend is expected to be built with **FastAPI** and incorporate a **Vector Database** for the AI (LLM) integration, as per the full assignment requirements.