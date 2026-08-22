# AlumniConnect Portal

AlumniConnect is a full-stack Alumni Data Management Portal. It is designed to bridge the gap between students and alumni through a clean, modern, and mobile-friendly web interface.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS v3 + Lucide Icons + TypeScript
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose Object Modeling)

---

## Features

1. **Alumni Directory**: A beautiful, card-based directory displaying all alumni profiles. It supports:
   - Search by name, job role, company, major, or specific skills.
   - Filtering by major and graduation year (dynamically populated from the profiles in the database).
   - Direct link to edit a profile by clicking the edit icon on any card.
2. **Profile Registration & Editing**: A comprehensive form to:
   - Register new alumni profiles with Name, Email, Grad Year, Major, Job Role, Company, Location, LinkedIn, Bio, and Skills.
   - Update existing profiles. Users can load their profile by typing in their registered email, or click "Edit" on the directory card to auto-fill the form.
3. **AI Mentor-Matching ("Find My Mentor")**:
   - Students can query mentors by entering a list of skills or interests (comma-separated).
   - The backend processes these skills and compares them against all alumni profiles using the **Jaccard Similarity** algorithm.
   - Matches are returned ranked in descending order of similarity, with badges showing the match percentage and highlighting which skills overlapped.

---

## System Architecture

```mermaid
graph TD
    subgraph Frontend (React + Vite)
        UI[App.tsx]
        CSS[Tailwind CSS v3]
        UI -->|GET /api/alumni| API_Fetch[Fetch API]
        UI -->|POST/PUT /api/alumni| API_Fetch
        UI -->|GET /api/match| API_Fetch
    end

    subgraph Backend (Express + Mongoose)
        SRV[server.js]
        RT_Alumni[routes/alumni.js]
        RT_Match[routes/match.js]
        MD_Alumni[models/Alumni.js]
        
        SRV --> RT_Alumni
        SRV --> RT_Match
        RT_Alumni --> MD_Alumni
        RT_Match --> MD_Alumni
    end

    DB[(MongoDB Atlas / Local)]
    MD_Alumni --> DB
```

### Jaccard Similarity Matching Logic
The Jaccard Similarity index is used to rank mentor matches based on skill overlap.
- Given a set of queried skills $Q$ and an alumnus's set of skills $A$:
  $$J(Q, A) = \frac{|Q \cap A|}{|Q \cup A|}$$
- The intersection $|Q \cap A|$ represents the matching skills.
- The union $|Q \cup A|$ represents all unique skills between both lists.
- Match percentage is calculated as $\text{Math.round}(J(Q, A) \times 100)$.
- Mentors are sorted in descending order of match percentage.

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (local community edition or a MongoDB Atlas cloud URI)

### Setup Instructions

#### 1. Setup Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   You can copy the template from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure the environment variables in `.env`:
   - `MONGODB_URI`: Replace `mongodb://localhost:27017/alumniconnect` with your MongoDB Atlas connection string (or leave as-is to use a local MongoDB instance).
   - `PORT`: Set the port for the server (defaults to `5000`).

#### 2. Setup Frontend
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Application

### Running Backend (Port 5000)
Run the following command inside the `/backend` folder:
```bash
# For development (with nodemon auto-restart)
npm run dev

# For production
npm start
```
*Note: On the first startup, if the database has 0 profiles, the backend will automatically seed 5 realistic, mock alumni profiles (Jane Doe, John Smith, Alice Johnson, Bob Williams, Emily Brown) so the directory is ready for immediate demonstration.*

### Running Frontend (Port 5173)
Run the following command inside the `/frontend` folder:
```bash
npm run dev
```
Open your browser and navigate to the local server address (usually [http://localhost:5173](http://localhost:5173)).

---

## API Endpoints

- **`GET /api/alumni`**
  - Fetches all alumni profiles, sorted by creation date descending.
- **`POST /api/alumni`**
  - Registers a new alumnus.
  - Body: `{ name, email, graduationYear, major, currentRole, company, location, linkedIn, bio, skills }`
- **`PUT /api/alumni/:id`**
  - Updates an alumnus profile by ID.
  - Body: same as registration.
- **`GET /api/match?skills=react,node`**
  - Evaluates similarity of alumni skills against the `skills` query parameter and returns them sorted by Jaccard similarity.
