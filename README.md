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

#### 2. Start Frontend Locally
```bash
# Create and setup frontend
cd frontend
npm install 
npm start
```

#### 3. Start Monolithic Core Locally
```bash
# Setup monolith
cd monolith
npm install
npm start
```

#### 4. Start Services Locally
```bash
# Setup analytics service
cd services/analytics-service
npm install
npm start
```
```bash
# Setup Bluesky service
cd services/bsky-service
npm install
npm start
```
```bash
# Setup recipe query service
cd services/recipe-query-service
npm install
npm start
```
```bash
# Setup Twitter service service
cd services/twitter-service
npm install
npm start
```

### ⚙️ Environment Variables

This project requires environment variables to connect to MongoDB and other external services.

### 1) Create `monolith/.env`

```bash
# Monolith Port
PORT=5000

# MongoDB connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority
```

### 2) Create `services/recipe-query-service/.env`

```bash
# Recipe query service port
PORT=3082

# Mistral AI Key for querying LLM models
MISTRAL_API_KEY=7QOauC1jWUCdIVZWstFclHuX058GwQIK
```

### Project Structure
```
TCSS559-RECIFEED/
├─ monolith/
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
│  ├─ utils/              # helpers (e.g., errorHandler.js)
│  ├─ .env                # NOT committed - use provided
│  └─ server.js           # Express app entry
│
├─ microservices/
│  ├─ analytics-service/
|  |  |─ .env             # NOT committed - use provided
│  │  └─ index.js
│  ├─ recipe-query-service/
|  |  |─ .env             # NOT committed - use provided
│  │  └─ index.js
│  ├─ twitter-service/
|  |  |─ .env             # NOT committed - use provided
│  │  └─ index.js
│  └─ bsky-service/
|     |─ .env             # NOT committed - use provided
│     └─ index.js
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
