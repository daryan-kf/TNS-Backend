# TNS Backend

A TypeScript/Express.js backend API for Tennis player assessment and management system.

## 🚀 Features

- **Player Assessment API**: Physiotherapists can submit comprehensive player assessments
- **RESTful API**: Clean and organized REST endpoints
- **TypeScript**: Full type safety and better development experience
- **Database Integration**: Supabase integration for data persistence
- **Security**: Helmet middleware for security headers
- **CORS Support**: Cross-origin resource sharing enabled
- **Request Logging**: Morgan middleware for HTTP request logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for database)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

4. Build the project:

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

The server will start on `http://localhost:3000`
