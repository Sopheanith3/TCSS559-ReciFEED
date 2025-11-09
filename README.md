# ReciFEED - Social Recipe Sharing Platform

## Quick Setup Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ReciFEED
```

#### 2. Setup Frontend
```bash
# Create and setup frontend
cd frontend
npm install 
npm start
```

#### 3. Setup Backend
```bash
# Setup backend
cd backend
npm install
npm start
```

#### 4. Configure Scripts

Add to root `package.json`:
```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.9.5",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```

Add to `backend/package.json`:
```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "Celestine Buendia & Sopheanith Ny",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.13.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "mongodb": "^7.0.0",
    "mongoose": "^8.19.3",
    "multer": "^2.0.2",
    "nodemon": "^3.1.10"
  },
  "description": ""
}

```

### Project Structure
```
TCSS559-RECIFEED/
├─ backend/
│  ├─ controllers/
│  │  ├─ postController.js
│  │  ├─ recipeController.js
│  │  ├─ searchController.js
│  │  └─ userController.js
│  ├─ database/
│  │  ├─ initialization/
│  │  │  ├─ createIndexes.js
│  │  │  └─ importExampleData.js
│  │  └─ connection.js
│  ├─ models/
│  │  ├─ post.js
│  │  ├─ recipe.js
│  │  ├─ search.js
│  │  └─ user.js
│  ├─ routes/
│  │  ├─ postRoutes.js
│  │  ├─ recipeRoutes.js
│  │  ├─ searchRoutes.js
│  │  └─ userRoutes.js
│  ├─ service/            # shared business logic (e.g., error handling)
│  ├─ utils/              # helpers (e.g., errorHandler.js)
│  ├─ .env                # NOT committed – use .env.example
│  └─ server.js           # Express app entry
│
└─ frontend/
   ├─ public/
   └─ src/
      ├─ assets/          # icons & logos
      ├─ components/
      │  ├─ Feed.css
      │  ├─ Home.css
      │  ├─ Login.css
      │  ├─ Recipe.css
      │  └─ Register.css
      ├─ layout/
      │  ├─ Navbar.css
      │  ├─ Navbar.js
      │  ├─ Sidebar.css
      │  └─ Sidebar.js
      └─ pages/
         ├─ Feed.js
         ├─ Home.js
         ├─ Login.js
         ├─ Recipe.js
         └─ Register.js

```

### Technologies Used
- **Frontend**: React.js, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **Authentication**: JWT tokens
- **Image Upload**: Multer

### Team Members
- Celestine Buendia 
- Sopheanith Ny 

### License
MIT
