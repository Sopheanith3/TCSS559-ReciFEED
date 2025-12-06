# ReciFEED - Social Recipe Sharing Platform

## 1. Local Setup Guide

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
PORT=3083

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
MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

# JWT Secret - MUST MATCH MONOLITH
JWT_SECRET=5e01f95b10e1688ad88a1ddd2d85f9fb7c8d8bb4ea977f507010b8682bd0604a7ae7f6481b648b898dfd612e83f9279d85b7911d2bb4fb07a6a7165a4e767932
```

### 4) Create `microservices/bsky-service/.env`

```bash
# Bsky Service port
PORT=3082

# MongoDB connection URI (recifeed_db)
MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

# JWT Secret - MUST MATCH MONOLITH
JWT_SECRET=5e01f95b10e1688ad88a1ddd2d85f9fb7c8d8bb4ea977f507010b8682bd0604a7ae7f6481b648b898dfd612e83f9279d85b7911d2bb4fb07a6a7165a4e767932
```

### 5) Create `microservices/analytics-service/.env`

```bash
# Analytics Service port
PORT=3081

# MongoDB connection URI (recifeed_db)
MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority

# JWT Secret - MUST MATCH MONOLITH
JWT_SECRET=5e01f95b10e1688ad88a1ddd2d85f9fb7c8d8bb4ea977f507010b8682bd0604a7ae7f6481b648b898dfd612e83f9279d85b7911d2bb4fb07a6a7165a4e767932
```

## 2. Running the Application on Kubernetes

Running on Kubernetes can run the application with its current request paths, which are not local the process above generates.

### Deploy `analytics-service` to GKE

`analytics-service` in this current project implementation is the only microservice deployed on the cloud, as seen in its external IP. Follow these steps to deploy the service to the cloud.

1. Follow the [Google Kubernetes tutorial for deploying a Docker project to GKE](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/kubernetes-engine-overview), and replace all instances of the example `hello-app` from the demo with our ReciFEED project, building the Docker image in the `microservices/analytics-service` folder, until you reach the  **Deploy the hello-app to GKE** step.

2. Change the `image` name in `/k8s/production/analytics-deployment.yaml` to the docker image name built in this tutorial.

3. Once you create the GKE cluster, to covers those settings to deploy the pods and start the service, instead of the remaining steps, run:

```bash
kubectl apply -f k8s/production
```

4. Create needed environment secrets for this deployment, using the same `.env` values as the rest of the project for these two:

```bash
kubectl create secret generic analytics-secret \
  --from-literal=MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority \
  --from-literal=JWT_SECRET=<CRYPTOGRAPHIC_KEY>
```

5. Now when you should see `recipe-service` pods running when you run:

```bash
kubectl get pods
```

6. Now the external IP of this service should be available when you run:

```bash
kubectl get service
```

7. This is the IP being used in `frontend/src/services/analyticsService.js` to make calls to the analytics service. To use your IP, replace this one.

### Deploy all other services and monolith to your local machine.

On your local terminal, build and deploy all others to minikube Kubernetes.

1. Start minikube and set to Docker environment.
```bash
minikube start --driver=docker
eval $(minikube -p minikube docker-env)
```

2. Create secret keys from the above `.env` in this environment.
```bash
kubectl create secret generic api-secret \
--from-literal="MONGODB_URI=mongodb+srv://<username>:<password>@recifeed-cluster-0.yywkfdd.mongodb.net/recifeed_db?retryWrites=true&w=majority" \
--from-literal=JWT_SECRET="<CRYPTOGRAPHIC_KEY>"

kubectl create secret generic recipe-query-secret \
--from-literal=MISTRAL_API_KEY="<KEY>"

kubectl create secret generic twitter-secret \
--from-literal=TWITTER_CONSUMER_KEY="<KEY>" \
--from-literal=TWITTER_CONSUMER_SECRET="<KEY>"
```
3. Build all Docker images

```bash
docker build -t monolith:latest ./ReciFEED/monolith
cd ./ReciFEED/microservices
docker build -t bsky-service:latest ./bsky-service
docker build -t recipe-query-service:latest ./recipe-query-service
docker build -t twitter-service:latest ./twitter-service
```

4. Install Ingress
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

5. Apply all config files to deploy and get services

```bash
kubectl apply -f k8s/local
```

6. Pods should be running when you run:

```bash
kubectl get pod
```

7. Get Ingress External IP and use as the host of all services

```bash
kubectl get ingress
```

8. Update local hosts file to run IP on `recifeed.example.com`. Add to /etc/hosts:
```bash
<INGRESS-IP> assign4.example.com
```

9. Use `assign4.example.com` as the base URL for all services.

## 3. External Services

The project connects to the following external services.

### Mistral

### Twitter/X

### Bluesky

## 4. API Documentation

## 5. Operations

### Monitoring

The analytics dashboard is available on the frontend at the route http://localhost:3000/analytics. It currently contains the following metrics for this application:
- Current Active Users (unique users which have logged a meaningful interaction within the last minutes)
- Live Post Interactions (number of comments and likes within the last 3 seconds)
- Live Recipe Views (number within the last 3 seconds)
- Most Popular User Pages (within the last 1d, 1w, 1m)
- Most Popular Recipe Pages (within the last 1d, 1w, 1m)
- Most Popular Search Terms (within the last 1d, 1w, 1m)

### Troubleshooting


## Project Structure
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
|  |  ├─ database/
│  |  │  └─ connection.js
|  |  ├─ models/
│  |  │  └─ event.js
|  |  ├─ routes/
|  |  |  |─ eventRoutes.js
|  |  |  |─ popularRoutes.js
│  |  │  └─ liveRoutes.js
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
      │  ├─ Side_Bar.css
      │  └─ Side_Bar.js
      └─ pages/
         ├─ Feed.js
         ├─ Home.js
         ├─ Login.js
         ├─ Recipe.js
         └─ Register.js
```

## Technologies Used
- **Frontend**: React.js, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **Authentication**: JWT tokens
- **Image Upload**: Multer

## Team Members
- Celestine Buendia 
- Sopheanith Ny 

## License
MIT
