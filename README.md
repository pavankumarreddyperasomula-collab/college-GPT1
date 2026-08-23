# 🎓 SRKR Campus Assistant (College GPT)

[![SRKR Engineering College](https://img.shields.io/badge/College-SRKR%20Engineering%20College-blue.svg)](https://srkr.ac.in)
[![Regulation](https://img.shields.io/badge/Regulation-R23%20Autonomous-green.svg)](#)
[![Department](https://img.shields.io/badge/Department-AI%20%26%20Data%20Science-orange.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.14-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

**SRKR Campus Assistant** is an intelligent, full-stack campus management and RAG-powered AI chatbot platform designed specifically for **SAGI RAMA KRISHNAM RAJU (SRKR) ENGINEERING COLLEGE (Autonomous), Bhimavaram**.

---

## 🛠️ Tools & Technologies Used

### **Backend Framework & Services**
* **Python 3.14:** Core backend programming language.
* **FastAPI:** High-performance RESTful API framework with async support and automatic Swagger/OpenAPI documentation (`http://localhost:8000/docs`).
* **Groq LLM API:** High-speed AI inference engine powering RAG responses and circular notice drafting (`groq/compound`, `qwen/qwen3.6-27b`, `openai/gpt-oss-20b`).
* **ChromaDB / Local Vector Store:** Persistent vector database indexing campus guidelines, notices, and course syllabi.
* **Pydantic:** Data validation and settings management.
* **Uvicorn:** Lightning-fast ASGI web server implementation.

### **Frontend Framework & Libraries**
* **React 18:** Modern UI framework built using reusable component architecture.
* **Vite:** Next-generation frontend build tool providing instant HMR (Hot Module Replacement).
* **Tailwind CSS:** Utility-first CSS framework for ultra-responsive styling, glassmorphism UI, and aurora backgrounds.
* **Framer Motion:** Fluid animation library for smooth modal transitions and UI feedback.
* **Lucide React:** Modern icon set for campus categories, roles, and navigation.

---

## ✨ Key Features

1. **🤖 RAG-Powered AI Chatbot (`College GPT`):**
   * Intelligent query answering based on official college records and curriculum.
   * Smart formal greeting interceptor (*"Good morning"*, *"Greetings"*, *"Hello Sir"*).
2. **📚 Full R23 B.Tech AI & DS Syllabus Knowledge Base:**
   * Includes complete course structures, credit schemes, evaluation marks (CIE/SEE), unit-by-unit syllabus breakdowns, and textbooks for **Years 1, 2, and 3**.
3. **🔑 Multi-Role Portal:**
   * **Student Portal:** OTP login, HOD-linked notices, hostel guidelines, and quick hub.
   * **Admin Hub:** Super Admin, HOD, Hostel Admin, and Faculty roles for issuing targeted campus notices and events.
4. **📄 AI Document Formatter:**
   * Converts unstructured text into professionally formatted campus circulars.
5. **🗺️ Interactive Campus Utilities:**
   * Interactive SRKR Campus Map viewer, Event calendar, and Rulebook modal.

---

## 📁 Repository Structure

```text
campus-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application routes
│   │   ├── rag.py           # RAG search & Groq LLM answer generator
│   │   ├── auth.py          # Student OTP & Admin authentication
│   │   └── config.py        # Environment variables & API keys
│   ├── chroma_db/           # Persistent vector knowledge stores
│   ├── requirements.txt     # Python dependencies
│   └── seed.py              # Database seeding script for R23 syllabus
├── frontend/
│   ├── public/              # Logos and static campus maps
│   ├── src/
│   │   ├── components/      # Modals, Chat interface, Aurora UI
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # React DOM entry point
│   ├── package.json         # Node.js dependencies
│   ├── tailwind.config.js   # Tailwind configuration
│   └── vite.config.js       # Vite configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. **Backend Setup**
```bash
cd backend
py -m pip install -r requirements.txt
py seed.py
py -m uvicorn app.main:app --reload --port 8000
```
* Backend running at: `http://localhost:8000`
* API Docs: `http://localhost:8000/docs`

### 2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
* Frontend running at: `http://localhost:5173`

---

## 📜 License & Acknowledgments

Developed for **SAGI RAMA KRISHNAM RAJU (SRKR) ENGINEERING COLLEGE (AUTONOMOUS)**  
*SRKR Marg, China Amiram, Bhimavaram – 534204, W.G. Dist., A.P., India*  
Accredited by NAAC with **'A+'** Grade.
