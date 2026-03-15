# EcoDistrict Enterprise Backend

Node.js + Express + PostgreSQL backend for the EcoDistrict Enterprise renewable energy calculator.

## Prerequisites

- Node.js 16+ (already installed)
- PostgreSQL 12+ (local or remote)
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your PostgreSQL connection details:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/ecodistrict_dev
   JWT_SECRET=your_secret_key_here
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   ```

## Database Setup

### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name ecodistrict-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ecodistrict_dev \
  -p 5432:5432 \
  -d postgres:latest

# Create database (if not created by above)
docker exec ecodistrict-db createdb -U postgres ecodistrict_dev
```

### Option 2: Local PostgreSQL

```bash
# Create database
createdb ecodistrict_dev

# Update DATABASE_URL in .env with your credentials
```

## Running the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will automatically create tables on first run.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info (requires token)

### Projects (`/api/projects`)
All endpoints require JWT authentication (Bearer token in Authorization header)

- `POST /projects` - Create new project
- `GET /projects` - List all projects for current user
- `GET /projects/:id` - Get specific project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Health Check
- `GET /api/health` - Check if backend is running

## Testing Endpoints

Using curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create project (replace TOKEN with actual token from login)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name":"Solar Project",
    "facilityType":"corporate",
    "infrastructureStatus":"new",
    "roofSpace":25000,
    "solarAllocation":60,
    "windTurbines":15,
    "totalCapex":5000000,
    "annualSavings":450000,
    "paybackYears":11.1,
    "co2Offset":120,
    "chartData":[]
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Express app entry point
│   ├── config.js              # Database configuration
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   └── projects.js        # Project endpoints
│   ├── controllers/
│   │   ├── authController.js  # Auth business logic
│   │   └── projectController.js # Project business logic
│   ├── models/
│   │   ├── User.js            # User database operations
│   │   └── Project.js         # Project database operations
│   └── utils/                 # Helper utilities
├── .env                       # Environment variables (git ignored)
├── .env.example               # Example env variables
├── package.json
└── README.md
```

## Environment Variables

- `NODE_ENV` - `development` | `production`
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `CORS_ORIGIN` - Frontend URL for CORS

## Next Steps

1. Set up PostgreSQL database
2. Update `.env` with database credentials
3. Install dependencies: `npm install`
4. Start server: `npm run dev`
5. Integrate with React frontend in `eco-app/`

## Frontend Integration

The React frontend needs to:
1. Create API client that uses `/api/auth` for authentication
2. Store JWT token in localStorage
3. Send token in Authorization header for API requests
4. Create UI for login/register and project management
5. Send project calculations to `/api/projects` for persistence

See the separate frontend integration plan in the main project documentation.
