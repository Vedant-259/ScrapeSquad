const robotsParser = require('robots-parser');
const { URL } = require('url');
const rateLimit = require('express-rate-limit');

// Cache for robots.txt files
const robotsCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Per-domain rate limiters
const domainLimiters = new Map();

// Common scraping-restricted paths
const RESTRICTED_PATHS = [
  '/login',
  '/signup',
  '/register',
  '/admin',
  '/dashboard',
  '/account',
  '/profile',
  '/api',
  '/private',
  '/secure'
];

// Known scraping-restricted domains
const RESTRICTED_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'youtube.com',
  'tiktok.com'
];

// Function to check if a URL is in a restricted domain
const isRestrictedDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return RESTRICTED_DOMAINS.some(restricted => domain.includes(restricted));
  } catch (error) {
    return true; // If URL parsing fails, assume restricted
  }
};

// Function to check if a URL contains restricted paths
const hasRestrictedPath = (url) => {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return RESTRICTED_PATHS.some(restricted => path.includes(restricted));
  } catch (error) {
    return true; // If URL parsing fails, assume restricted
  }
};

// Function to get or create a rate limiter for a domain
const getDomainLimiter = (domain) => {
  if (!domainLimiters.has(domain)) {
    domainLimiters.set(domain, rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // limit each domain to 10 requests per minute
      message: 'Too many requests to this domain. Please try again later.'
    }));
  }
  return domainLimiters.get(domain);
};

// Function to check robots.txt
const checkRobotsPermission = async (url) => {
  try {
    const domain = new URL(url).origin;
    const robotsUrl = `${domain}/robots.txt`;
    
    // Check cache first
    const cached = robotsCache.get(domain);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.robots.isAllowed(url, 'YourAppName Bot/1.0');
    }
    
    // Fetch robots.txt using dynamic import
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(robotsUrl);
    if (!response.ok) {
      // If robots.txt doesn't exist, assume scraping is allowed
      return true;
    }
    
    const robotsTxt = await response.text();
    const robots = robotsParser(robotsUrl, robotsTxt);
    
    // Cache the result
    robotsCache.set(domain, {
      robots,
      timestamp: Date.now()
    });
    
    return robots.isAllowed(url, 'YourAppName Bot/1.0');
  } catch (error) {
    console.error('Error checking robots.txt:', error);
    return false; // If we can't check robots.txt, err on the side of caution
  }
};

// Function to check terms of service
const checkTermsOfService = async (url) => {
  try {
    const domain = new URL(url).origin;
    const tosUrls = [
      `${domain}/terms-of-service`,
      `${domain}/terms`,
      `${domain}/tos`,
      `${domain}/legal`
    ];
    
    // Check each TOS URL
    const fetch = (await import('node-fetch')).default;
    for (const tosUrl of tosUrls) {
      try {
        const response = await fetch(tosUrl);
        if (response.ok) {
          const text = await response.text();
          // Check for common scraping restrictions
          const restrictions = [
            'scraping',
            'crawling',
            'automated access',
            'data extraction',
            'web scraping',
            'web crawling'
          ];
          
          if (restrictions.some(term => text.toLowerCase().includes(term))) {
            return false;
          }
        }
      } catch (error) {
        continue; // Try next URL if this one fails
      }
    }
    
    return true; // If no restrictions found, assume allowed
  } catch (error) {
    console.error('Error checking terms of service:', error);
    return false;
  }
};

// Main middleware function
const legalScrapingMiddleware = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    // Check for restricted domains
    if (isRestrictedDomain(url)) {
      return res.status(403).json({ 
        message: 'Scraping is not allowed for this domain due to legal restrictions' 
      });
    }
    
    // Check for restricted paths
    if (hasRestrictedPath(url)) {
      return res.status(403).json({ 
        message: 'Scraping is not allowed for this path due to legal restrictions' 
      });
    }
    
    // Check robots.txt
    const robotsAllowed = await checkRobotsPermission(url);
    if (!robotsAllowed) {
      return res.status(403).json({ 
        message: 'Scraping is not allowed according to robots.txt' 
      });
    }
    
    // Check terms of service
    const tosAllowed = await checkTermsOfService(url);
    if (!tosAllowed) {
      return res.status(403).json({ 
        message: 'Scraping is not allowed according to the website\'s terms of service' 
      });
    }
    
    // Apply rate limiting
    const domain = parsedUrl.hostname;
    const limiter = getDomainLimiter(domain);
    await limiter(req, res, next);
    
  } catch (error) {
    console.error('Legal scraping check error:', error);
    return res.status(500).json({ 
      message: 'Error performing legal scraping checks' 
    });
  }
};

module.exports = legalScrapingMiddleware; 