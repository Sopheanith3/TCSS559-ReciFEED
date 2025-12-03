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
PORT=5050

# MongoDB connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

# Token Generation Secret
JWT_SECRET=5e01f95b10e1688ad88a1ddd2d85f9fb7c8d8bb4ea977f507010b8682bd0604a7ae7f6481b648b898dfd612e83f9279d85b7911d2bb4fb07a6a7165a4e767932
```

### 2) Create `microservices/recipe-query-service/.env`

```bash
# Recipe query service port
PORT=3082

# Mistral AI Key for querying LLM models
MISTRAL_API_KEY=7QOauC1jWUCdIVZWstFclHuX058GwQIK
```

### 3) Create `microservices/twitter-service/.env`

```bash
# Twitter Service port
PORT=3084

# Twitter API Keys
TWITTER_CONSUMER_KEY=I7XuoARJzdlP1OZjqKqbnMscG
TWITTER_CONSUMER_SECRET=c6BMACuw7vQnXOQr0MrV5A0mHK1yl8hWJeXOlMPOh2TVI7qyPS

# MongoDB connection URI (recifeed_db)
MONGODB_URI=mongodb+srv://recifeed_dev_db_user:xyInl7KWe3vRzmQV@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

# JWT Secret - MUST MATCH MONOLITH
JWT_SECRET=5e01f95b10e1688ad88a1ddd2d85f9fb7c8d8bb4ea977f507010b8682bd0604a7ae7f6481b648b898dfd612e83f9279d85b7911d2bb4fb07a6a7165a4e767932
```

### 4) Create `microservices/bsky-service/.env`

```bash
# Bsky Service port
PORT=3082

# MongoDB connection URI (recifeed_db)
MONGODB_URI=mongodb+srv://recifeed_dev_db_user:xyInl7KWe3vRzmQV@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=5e01f95b10e1688ad88a1ddd2d85f9fb7c8d8bb4ea977f507010b8682bd0604a7ae7f6481b648b898dfd612e83f9279d85b7911d2bb4fb07a6a7165a4e767932
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
|  |  ├─ database/
│  |  │  └─ connection.js
|  |  ├─ models/
│  |  │  └─ twitterUserTokens.js
|  |  ├─ routes/
|  |  |  |─ post.js
│  |  │  └─ auth.js
|  |  |─ .env             # NOT committed - use provided
│  │  └─ index.js
│  └─ bsky-service/
|     ├─ database/
│     │  └─ connection.js
|     ├─ models/
│     │  └─ bskyUserToken.js
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
