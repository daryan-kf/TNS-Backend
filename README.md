# TNS Backend API

A secure, production-ready TypeScript/Express.js backend API for Tennis player management and performance analytics system.

## 🚀 Features

### Core Functionality

- **Player Management**: Comprehensive player data retrieval and search capabilities
- **Team Management**: Team information and member management
- **Training Sessions**: Player session tracking and analytics
- **Player Assessments**: Complete CRUD operations for physiotherapist assessments

### Security & Performance

- **Enterprise Security**: Rate limiting, CORS protection, input validation, SQL injection prevention
- **Request Validation**: Comprehensive Zod schema validation for all endpoints
- **Professional Logging**: Structured logging with Winston, security event tracking
- **Error Handling**: Secure error responses that don't expose sensitive information
- **Database Security**: Parameterized queries, connection timeouts, query byte limits

### Architecture

- **TypeScript**: Full type safety and enhanced developer experience
- **BigQuery Integration**: Scalable data analytics with Google Cloud BigQuery
- **RESTful Design**: Clean, predictable API endpoints following REST principles
- **Modular Structure**: Scalable controller organization for easy maintenance

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Google Cloud Project** with BigQuery enabled
- **BigQuery Datasets** configured for sports analytics

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file with the following variables:

   ```env
   # Application
   NODE_ENV=development
   PORT=3000

   # BigQuery Configuration
   BIGQUERY_PROJECT_ID=your_gcp_project_id
   BIGQUERY_LOCATION=US
   BQ_DATASET_SPORTS=your_sports_dataset
   BQ_TBL_PLAYER_TRAINING_SESSIONS=player_training_sessions
   BQ_TBL_TRAINING_SESSIONS=training_sessions
   BQ_TBL_PLAYER_TIMESERIES=player_timeseries

   # Security Configuration
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Authenticate with Google Cloud:**

   ```bash
   gcloud auth application-default login
   ```

5. **Build the project:**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

Currently using Firebase authentication on the frontend. Backend endpoints are secured with rate limiting and input validation.

---

## 🏓 Teams API

### Get All Teams

```http
GET /teams
```

**Response:**

```json
{
  "success": true,
  "message": "Teams retrieved successfully",
  "data": [...],
  "count": 5,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Get Team by ID

```http
GET /teams/:teamId
```

### Get Team Members

```http
GET /teams/:teamId/players
```

### Get Team Member Statistics

```http
GET /teams/:teamId/players/stats
```

---

## 👥 Players API

### Get All Players

```http
GET /players
```

### Search Players

```http
GET /players/search?query=player_name
```

**Query Parameters:**

- `query` (optional): Search term for player names

### Get Player by ID

```http
GET /players/:id
```

### Get Player Summary

```http
GET /players/:id/summary
```

---

## 🏃‍♂️ Training Sessions API

### Get Player Sessions

```http
GET /players/:id/sessions
```

**Query Parameters:**

- `limit` (default: 100): Number of sessions to return (1-1000)
- `offset` (default: 0): Pagination offset
- `start` (optional): ISO date string for session start filter
- `end` (optional): ISO date string for session end filter

### Get Player Session Statistics

```http
GET /players/:id/sessions/stats
```

---

## 📋 Player Assessments API

### Get All Player Assessments

```http
GET /players/:id/assessments
```

**Query Parameters:**

- `limit` (default: 10): Number of assessments to return (1-100)
- `offset` (default: 0): Pagination offset

### Create Player Assessment

```http
POST /players/:id/assessments
Content-Type: application/json

{
  "rangeOfMotion": "Excellent flexibility in all joints",
  "strengthLevels": "High overall strength levels",
  "balanceAndStability": "Good balance with minor improvements needed",
  "endurance": "Very good cardiovascular endurance",
  "speedAndAgility": "Excellent speed and direction changes"
}
```

### Get Specific Assessment

```http
GET /players/:id/assessments/:assessmentId
```

### Update Assessment

```http
PUT /players/:id/assessments/:assessmentId
Content-Type: application/json

{
  "rangeOfMotion": "Updated assessment notes",
  "strengthLevels": "Updated strength evaluation"
}
```

### Delete Assessment

```http
DELETE /players/:id/assessments/:assessmentId
```

---

## 🔒 Security Features

### Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Via environment variables
- **Headers**: Returns rate limit info in response headers

### Input Validation

- **Zod Schemas**: All requests validated with TypeScript schemas
- **Sanitization**: XSS protection and input cleaning
- **SQL Injection Protection**: Pattern detection and blocking

### CORS Protection

- **Origin Whitelist**: Only allowed origins can access the API
- **Credentials Support**: Secure cookie handling
- **Preflight Caching**: Optimized OPTIONS requests

### Security Headers

- **Helmet**: Comprehensive security headers
- **Content Security**: XSS and clickjacking protection
- **HSTS**: HTTPS enforcement in production

## 📊 Monitoring & Logging

### Structured Logging

- **Winston**: Professional logging with multiple transports
- **Security Events**: All security-related events are logged
- **Performance**: Query execution times and request duration
- **Error Tracking**: Comprehensive error logging with context

### Health Monitoring

- **Database Status**: BigQuery connection monitoring
- **System Metrics**: Memory usage and uptime tracking
- **Error Rates**: Application error monitoring

## 🏗️ Project Structure

```
src/
├── config/                 # Configuration files
│   ├── bigquery.ts         # BigQuery connection and helpers
│   ├── database.ts         # Database health checks
│   └── environment.ts      # Environment validation
├── controllers/            # Request handlers
│   ├── players/
│   │   ├── players.controller.ts
│   │   ├── player-sessions.controller.ts
│   │   ├── player-assessments.controller.ts
│   │   └── index.ts
│   └── teams/
│       ├── teams.controller.ts
│       ├── team-members.controller.ts
│       └── index.ts
├── middleware/             # Custom middleware
│   ├── security.ts         # Security middleware
│   ├── validation.ts       # Input validation
│   └── errorHandler.ts     # Global error handling
├── routes/                 # Route definitions
│   ├── player.ts
│   ├── team.ts
│   └── index.ts
├── schemas/                # Zod validation schemas
│   ├── players.ts
│   └── teams.ts
├── types/                  # TypeScript interfaces
│   └── index.ts
└── utils/                  # Utility functions
    ├── logger.ts
    └── responses.ts
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Deploy the `dist/` folder to your hosting platform

## 🧪 Testing

### API Testing

```bash
# Test basic endpoints
curl http://localhost:3000/
curl http://localhost:3000/players
curl http://localhost:3000/teams

# Test rate limiting
for i in {1..10}; do curl http://localhost:3000/players; done

# Test validation
curl -X POST http://localhost:3000/players/invalid-id/assessments \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📜 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the logs for detailed error information
- Review the API documentation above

## 🔄 Version History

- **v1.0.0**: Initial release with complete player and team management
  - Secure API endpoints
  - BigQuery integration
  - Comprehensive validation
  - Professional logging and monitoring
