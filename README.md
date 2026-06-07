# CareerAI — AI Resume Tailor & Interview Preparation Platform

CareerAI is a full-stack platform designed to bridge the gap between candidates and their target job roles. By leveraging the Google Gemini AI API, the application analyzes resumes against specific job descriptions to provide actionable insights, tailored preparation plans, and ATS-optimized resumes.

## Core Features

*   **Resume Analysis:** Compares candidate profiles with job descriptions to identify match scores and skill gaps.
*   **Interview Preparation:** Generates personalized technical and behavioral questions with suggested answers and interviewer intentions.
*   **Preparation Roadmap:** Provides a structured, day-wise plan to help candidates prepare for specific interviews effectively.
*   **Resume PDF Generation:** Uses Puppeteer to generate professional, tailored resumes in PDF format based on AI-optimized content.
*   **Authenticated Access:** Includes a secure authentication system with protected routes for user-specific data.

## Tech Stack

### Frontend
*   React (Vite)
*   React Router & Context API
*   SCSS (Feature-based architecture)

### Backend
*   Node.js & Express.js
*   MongoDB (Mongoose)
*   Zod (Schema validation)

### AI & Utilities
*   **Google Gemini API:** Powering the intelligence engine.
*   **Puppeteer:** For high-fidelity HTML-to-PDF conversion.
*   **pdf-parse:** For extracting text from uploaded resumes.

## Project Structure

```text
CareerAI/
├── frontend/          # React application
│   └── src/
│       ├── features/  # Domain-driven modules
│       └── style/     # Global and component styles
└── backend/           # Node.js API
    └── src/
        ├── controllers/ # Request handling
        ├── services/    # Business logic & AI integration
        └── models/      # Database schemas
```

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB instance
*   Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <git remote add origin https://github.com/KrishnaGhimire668/ai-resume-interview-prep.git>
    cd CareerAI
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    GOOGLE_GENAI_API_KEY=your_api_key
    JWT_SECRET=your_jwt_secret
    ```
    Start the server: `npm run dev`

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

## Workflow

1.  **Input:** User uploads an existing resume (PDF) and provides a job description.
2.  **Analysis:** The backend parses the PDF and sends the content to Gemini AI with structured Zod schemas.
3.  **Insights:** The user receives a match score, identified skill gaps, and a customized interview roadmap.
4.  **Output:** The system generates a tailored, ATS-friendly resume that can be downloaded as a PDF.



## Author

**Krishna Ghimire**  
Full Stack Developer specializing in AI-integrated web applications and scalable Node.js systems.

*This project was developed for portfolio and educational purposes.*