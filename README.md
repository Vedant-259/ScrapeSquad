# Legal Web Scraping Application

A modern web scraping application built with React, Express, and MongoDB that strictly adheres to legal and ethical scraping practices.

## Legal Compliance Features

- **Robots.txt Compliance**: Automatically checks and respects robots.txt files
- **Terms of Service Checking**: Verifies website terms of service for scraping restrictions
- **Rate Limiting**: Implements per-domain rate limiting to prevent server overload
- **Restricted Content Protection**: Blocks scraping of sensitive areas (login pages, admin areas, etc.)
- **Known Restricted Domains**: Prevents scraping of major social media and content platforms
- **Proper User Agent Identification**: Clearly identifies the scraper in requests
- **Request Delays**: Implements delays between requests to reduce server load
- **Legal Notices**: Includes legal disclaimers with scraped data

## Features

- User authentication (register/login)
- Modern and responsive UI
- Web scraping with Playwright
- API access with API keys
- Rate limiting and security measures
- Cross-Origin Resource Sharing (CORS) enabled

## Tech Stack

- Frontend: React.js (Vite)
- Backend: Express.js
- Database: MongoDB
- Authentication: JWT
- Web Scraping: Playwright
- Legal Compliance: robots-parser, custom middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd website-scraping-app
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

5. Start the development servers:

For backend:
```bash
npm run dev
```

For frontend:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Legal Considerations

This application implements several measures to ensure legal and ethical web scraping:

1. **Robots.txt Compliance**: The application checks and respects robots.txt files before scraping any website.

2. **Terms of Service**: The application attempts to check website terms of service for scraping restrictions.

3. **Rate Limiting**: Implements strict rate limiting per domain to prevent server overload.

4. **Restricted Content**: Automatically blocks scraping of sensitive areas like login pages and admin areas.

5. **Known Restrictions**: Prevents scraping of major social media platforms and content services.

6. **Proper Identification**: Uses a clear user agent string to identify the scraper.

7. **Request Delays**: Implements delays between requests to reduce server load.

8. **Legal Notices**: Includes legal disclaimers with scraped data.

## API Usage

### Authentication

1. Register a new user:
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "your@email.com",
  "password": "yourpassword"
}
```

2. Login:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

### Web Scraping

1. Using the web interface:
   - Log in to your account
   - Navigate to the dashboard
   - Enter the URL you want to scrape
   - Click "Scrape Website"

2. Using the API:
```bash
POST /api/scrape/api
Content-Type: application/json

{
  "url": "https://example.com",
  "apiKey": "your_api_key"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Rate limiting on API endpoints
- CORS enabled for frontend-backend communication
- Helmet.js for security headers

## License

MIT #   S c r a p e S q u a d  
 