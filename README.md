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

## ⚙️ Environment Variables

This project requires environment variables to connect to MongoDB.


A sample file is provided:  
`backend/.env.example or backend/.env `

### 1) Create `backend/.env`

```bash
#Backend Port
PORT=5000

# MongoDB connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

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
