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
npx create-react-app frontend
cd frontend
npm install 
cd ..
```

#### 3. Setup Backend
```bash
# Setup backend
cd backend
npm init -y
npm install express multer axios nodemon
cd ..
```

#### 4. Configure Scripts

Add to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run backend\" \"npm run frontend\"",
    "backend": "cd backend && npm run dev",
    "frontend": "cd frontend && npm start",
    "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install"
  }
}
```

Add to `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Project Structure
```
ReciFEED/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── .env
└── package.json
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
