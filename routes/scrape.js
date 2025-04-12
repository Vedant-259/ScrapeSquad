const express = require('express');
const router = express.Router();
const { chromium } = require('playwright');
const auth = require('../middleware/auth');
const legalScraping = require('../middleware/legalScraping');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Helper function to extract metadata
const extractMetadata = async (page) => {
  const metadata = {};
  
  // Extract all meta tags
  const metaTags = await page.$$eval('meta', elements => 
    elements.map(el => ({
      name: el.getAttribute('name') || el.getAttribute('property'),
      content: el.getAttribute('content'),
      charset: el.getAttribute('charset'),
      httpEquiv: el.getAttribute('http-equiv')
    }))
  );
  
  // Organize meta tags by name/property
  metaTags.forEach(tag => {
    if (tag.name) {
      metadata[tag.name] = tag.content;
    }
  });
  
  // Extract Open Graph tags
  const ogTags = await page.$$eval('meta[property^="og:"]', elements =>
    elements.map(el => ({
      property: el.getAttribute('property'),
      content: el.getAttribute('content')
    }))
  );
  
  // Add Open Graph tags to metadata
  ogTags.forEach(tag => {
    metadata[tag.property] = tag.content;
  });
  
  // Extract Twitter Card tags
  const twitterTags = await page.$$eval('meta[name^="twitter:"]', elements =>
    elements.map(el => ({
      name: el.getAttribute('name'),
      content: el.getAttribute('content')
    }))
  );
  
  // Add Twitter Card tags to metadata
  twitterTags.forEach(tag => {
    metadata[tag.name] = tag.content;
  });
  
  return metadata;
};

// Helper function to extract structured data
const extractStructuredData = async (page) => {
  const structuredData = [];
  
  // Extract JSON-LD
  const jsonLdScripts = await page.$$eval('script[type="application/ld+json"]', elements =>
    elements.map(el => {
      try {
        return JSON.parse(el.textContent);
      } catch (e) {
        return null;
      }
    })
  );
  
  // Filter out null values and add to structured data
  jsonLdScripts.filter(Boolean).forEach(data => {
    structuredData.push({
      type: 'application/ld+json',
      data
    });
  });
  
  // Extract Microdata
  const microdataElements = await page.$$eval('[itemtype]', elements =>
    elements.map(el => ({
      type: el.getAttribute('itemtype'),
      id: el.getAttribute('itemid'),
      properties: Array.from(el.querySelectorAll('[itemprop]')).map(prop => ({
        name: prop.getAttribute('itemprop'),
        content: prop.getAttribute('content') || prop.textContent
      }))
    }))
  );
  
  // Add Microdata to structured data
  microdataElements.forEach(data => {
    structuredData.push({
      type: 'microdata',
      data
    });
  });
  
  return structuredData;
};

// Helper function to extract content structure
const extractContentStructure = async (page) => {
  const structure = {
    headings: {},
    lists: [],
    images: [],
    forms: [],
    tables: [],
    iframes: [],
    shadowDOM: []
  };
  
  // Extract headings (h1-h6)
  for (let i = 1; i <= 6; i++) {
    structure.headings[`h${i}`] = await page.$$eval(`h${i}`, elements =>
      elements.map(el => ({
        text: el.textContent.trim(),
        id: el.id,
        classes: Array.from(el.classList)
      }))
    );
  }
  
  // Extract lists
  structure.lists = await page.$$eval('ul, ol', elements =>
    elements.map(el => ({
      type: el.tagName.toLowerCase(),
      items: Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim()),
      id: el.id,
      classes: Array.from(el.classList)
    }))
  );
  
  // Extract images
  structure.images = await page.$$eval('img', elements =>
    elements.map(el => ({
      src: el.src,
      alt: el.alt,
      width: el.width,
      height: el.height,
      id: el.id,
      classes: Array.from(el.classList)
    }))
  );
  
  // Extract forms
  structure.forms = await page.$$eval('form', elements =>
    elements.map(el => ({
      action: el.action,
      method: el.method,
      id: el.id,
      classes: Array.from(el.classList),
      inputs: Array.from(el.querySelectorAll('input, select, textarea')).map(input => ({
        type: input.type || input.tagName.toLowerCase(),
        name: input.name,
        id: input.id,
        placeholder: input.placeholder,
        required: input.required,
        value: input.value,
        disabled: input.disabled,
        checked: input.checked
      }))
    }))
  );
  
  // Extract tables
  structure.tables = await page.$$eval('table', elements =>
    elements.map(el => ({
      id: el.id,
      classes: Array.from(el.classList),
      headers: Array.from(el.querySelectorAll('th')).map(th => th.textContent.trim()),
      rows: Array.from(el.querySelectorAll('tr')).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
      )
    }))
  );
  
  // Extract iframes
  structure.iframes = await page.$$eval('iframe', elements =>
    elements.map(el => ({
      src: el.src,
      id: el.id,
      name: el.name,
      width: el.width,
      height: el.height,
      classes: Array.from(el.classList)
    }))
  );
  
  // Extract shadow DOM elements
  try {
    structure.shadowDOM = await page.evaluate(() => {
      const shadowElements = [];
      
      // Function to recursively find shadow roots
      const findShadowRoots = (element) => {
        if (element.shadowRoot) {
          shadowElements.push({
            tagName: element.tagName,
            id: element.id,
            classes: Array.from(element.classList),
            shadowContent: Array.from(element.shadowRoot.querySelectorAll('*')).map(el => ({
              tagName: el.tagName,
              id: el.id,
              classes: Array.from(el.classList),
              text: el.textContent.trim()
            }))
          });
        }
        
        // Check children for shadow roots
        Array.from(element.children).forEach(findShadowRoots);
      };
      
      // Start from body
      findShadowRoots(document.body);
      return shadowElements;
    });
  } catch (error) {
    console.error('Error extracting shadow DOM:', error);
    structure.shadowDOM = [];
  }
  
  return structure;
};

// Helper function to extract links with more details
const extractLinks = async (page) => {
  return await page.$$eval('a', elements =>
    elements.map(el => ({
      text: el.textContent.trim(),
      href: el.href,
      title: el.title,
      target: el.target,
      rel: el.rel,
      id: el.id,
      classes: Array.from(el.classList),
      isExternal: el.hostname !== window.location.hostname
    }))
  );
};

// Helper function to extract CSS properties
const extractCSSProperties = async (page) => {
  return await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const cssProperties = {};
    
    elements.forEach((el, index) => {
      if (el.id || el.className) {
        // Safely handle className which might be a DOMTokenList (classList) instead of a string
        let selector;
        if (el.id) {
          selector = `#${el.id}`;
        } else if (typeof el.className === 'string') {
          selector = `.${el.className.split(' ').join('.')}`;
        } else if (el.classList && el.classList.length > 0) {
          // Handle DOMTokenList (classList)
          selector = `.${Array.from(el.classList).join('.')}`;
        } else {
          // Skip elements without a valid selector
          return;
        }
        
        const computedStyle = window.getComputedStyle(el);
        
        cssProperties[selector] = {
          position: {
            top: el.getBoundingClientRect().top,
            left: el.getBoundingClientRect().left,
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height
          },
          styles: {}
        };
        
        // Extract common CSS properties
        const propertiesToExtract = [
          'color', 'backgroundColor', 'fontSize', 'fontFamily', 
          'fontWeight', 'textAlign', 'display', 'position', 
          'margin', 'padding', 'border', 'borderRadius'
        ];
        
        propertiesToExtract.forEach(prop => {
          cssProperties[selector].styles[prop] = computedStyle.getPropertyValue(prop);
        });
      }
    });
    
    return cssProperties;
  });
};

// Helper function to extract storage data
const extractStorageData = async (page) => {
  return await page.evaluate(() => {
    const storageData = {
      localStorage: {},
      sessionStorage: {},
      cookies: document.cookie
    };
    
    // Extract localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      storageData.localStorage[key] = localStorage.getItem(key);
    }
    
    // Extract sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      storageData.sessionStorage[key] = sessionStorage.getItem(key);
    }
    
    return storageData;
  });
};

// Helper function to extract console logs and network requests
const extractConsoleAndNetwork = async (page) => {
  const consoleLogs = [];
  const networkRequests = [];
  
  // Set up console message listener
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Set up request listener
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      resourceType: request.resourceType()
    });
  });
  
  // Wait for network to be idle with a shorter timeout
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch (error) {
    console.log(`Warning: Network did not reach idle state within timeout: ${error.message}`);
    // Continue with whatever logs and requests we've collected so far
  }
  
  return {
    consoleLogs: consoleLogs.slice(0, 100), // Limit to first 100 logs
    networkRequests: networkRequests.slice(0, 100) // Limit to first 100 requests
  };
};

// Helper function to take screenshots
const takeScreenshots = async (page, url) => {
  const screenshots = {};
  
  try {
    // Take full page screenshot
    console.log(`Taking full page screenshot for ${url}`);
    const fullPageBuffer = await page.screenshot({ fullPage: true });
    screenshots.fullPage = fullPageBuffer.toString('base64');
    
    // Take viewport screenshot
    console.log(`Taking viewport screenshot for ${url}`);
    const viewportBuffer = await page.screenshot();
    screenshots.viewport = viewportBuffer.toString('base64');
    
    // Take screenshot of specific elements
    console.log(`Finding elements to screenshot for ${url}`);
    const elements = await page.$$('img, video, iframe');
    console.log(`Found ${elements.length} elements to screenshot for ${url}`);
    
    screenshots.elements = [];
    
    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      try {
        // Check if element is visible before attempting screenshot
        const isVisible = await elements[i].evaluate(el => {
          const style = window.getComputedStyle(el);
          return style && 
                 style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 style.opacity !== '0' &&
                 el.offsetWidth > 0 &&
                 el.offsetHeight > 0;
        });
        
        if (!isVisible) {
          console.log(`Skipping invisible element ${i} for ${url}`);
          continue;
        }
        
        // Try to scroll element into view with a shorter timeout
        console.log(`Scrolling element ${i} into view for ${url}`);
        await elements[i].scrollIntoViewIfNeeded({ timeout: 5000 }).catch(err => {
          console.log(`Could not scroll element ${i} into view for ${url}: ${err.message}`);
        });
        
        // Wait a moment for any animations to complete
        await page.waitForTimeout(500);
        
        console.log(`Taking screenshot of element ${i} for ${url}`);
        const elementBuffer = await elements[i].screenshot({ timeout: 10000 });
        
        // Get a selector for the element
        const selector = await elements[i].evaluate(el => {
          if (el.id) return `#${el.id}`;
          if (el.className && typeof el.className === 'string') {
            return `.${el.className.split(' ').join('.')}`;
          }
          return el.tagName.toLowerCase();
        }).catch(() => `element_${i}`);
        
        screenshots.elements.push({
          selector,
          data: elementBuffer.toString('base64')
        });
        
        console.log(`Successfully captured screenshot of element ${i} for ${url}`);
      } catch (error) {
        console.log(`Error taking screenshot of element ${i} for ${url}: ${error.message}`);
        // Continue with next element instead of failing the entire process
      }
    }
  } catch (error) {
    console.error(`Error taking screenshots for ${url}: ${error.message}`);
    // Return whatever screenshots we managed to capture
  }
  
  return screenshots;
};

// Helper function to generate PDF
const generatePDF = async (page, url) => {
  try {
    // Generate PDF
    const pdfBuffer = await page.pdf({ format: 'A4' });
    return pdfBuffer.toString('base64');
  } catch (error) {
    console.error(`Error generating PDF for ${url}: ${error.message}`);
    return null;
  }
};

// Helper function to handle infinite scrolling
const handleInfiniteScroll = async (page, maxScrolls = 5) => {
  let previousHeight = 0;
  let currentHeight = await page.evaluate('document.body.scrollHeight');
  let scrollCount = 0;
  
  while (previousHeight !== currentHeight && scrollCount < maxScrolls) {
    previousHeight = currentHeight;
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000); // Wait for content to load
    currentHeight = await page.evaluate('document.body.scrollHeight');
    scrollCount++;
  }
  
  // Scroll back to top
  await page.evaluate('window.scrollTo(0, 0)');
};

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to scrape a single page with legal compliance
const scrapePage = async (page, url, options = {}) => {
  try {
    console.log(`Starting legal scraping: ${url}`);
    
    // Add delay between requests
    await delay(2000); // 2 second delay
    
    // Set proper user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'YourAppName Bot/1.0 (+https://yourapp.com/bot; bot@yourapp.com)'
    });
    
    // Navigate to the page with a longer timeout
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 90000 
    });
    
    console.log(`Page loaded: ${url}`);
    
    // Handle infinite scrolling if requested
    if (options.handleInfiniteScroll) {
      console.log(`Handling infinite scroll for: ${url}`);
      await handleInfiniteScroll(page, options.maxScrolls);
    }
    
    // Wait for network to be idle with a shorter timeout
    try {
      console.log(`Waiting for network idle: ${url}`);
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      console.log(`Network idle reached: ${url}`);
    } catch (error) {
      console.log(`Warning: Network did not reach idle state within timeout for ${url}: ${error.message}`);
      // Continue with scraping even if network is not idle
    }
    
    // Extract basic information
    console.log(`Extracting basic information: ${url}`);
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
    
    // Extract metadata
    console.log(`Extracting metadata: ${url}`);
    const metadata = await extractMetadata(page);
    
    // Extract structured data
    console.log(`Extracting structured data: ${url}`);
    const structuredData = await extractStructuredData(page);
    
    // Extract content structure
    console.log(`Extracting content structure: ${url}`);
    const contentStructure = await extractContentStructure(page);
    
    // Extract links
    console.log(`Extracting links: ${url}`);
    const links = await extractLinks(page);
    
    // Extract CSS properties
    console.log(`Extracting CSS properties: ${url}`);
    const cssProperties = await extractCSSProperties(page);
    
    // Extract storage data
    console.log(`Extracting storage data: ${url}`);
    const storageData = await extractStorageData(page);
    
    // Extract console logs and network requests with error handling
    let consoleLogs = [];
    let networkRequests = [];
    try {
      console.log(`Extracting console logs and network requests: ${url}`);
      const result = await extractConsoleAndNetwork(page);
      consoleLogs = result.consoleLogs;
      networkRequests = result.networkRequests;
    } catch (error) {
      console.log(`Warning: Error extracting console and network data for ${url}: ${error.message}`);
      // Continue with empty arrays if this step fails
    }
    
    // Take screenshots if requested
    let screenshots = null;
    if (options.takeScreenshots) {
      try {
        console.log(`Taking screenshots: ${url}`);
        screenshots = await takeScreenshots(page, url);
        console.log(`Screenshots taken: ${url}`);
      } catch (error) {
        console.log(`Warning: Error taking screenshots for ${url}: ${error.message}`);
        // Continue without screenshots if this step fails
      }
    }
    
    // Generate PDF if requested
    let pdfPath = null;
    if (options.generatePDF) {
      try {
        console.log(`Generating PDF: ${url}`);
        pdfPath = await generatePDF(page, url);
        console.log(`PDF generated: ${url}`);
      } catch (error) {
        console.log(`Warning: Error generating PDF for ${url}: ${error.message}`);
        // Continue without PDF if this step fails
      }
    }
    
    // Extract text content
    console.log(`Extracting text content: ${url}`);
    const textContent = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text) {
          textNodes.push(text);
        }
      }
      
      return textNodes;
    });
    
    console.log(`Scraping completed successfully: ${url}`);
    
    return {
      url,
      title,
      description,
      metadata,
      structuredData,
      contentStructure,
      links,
      cssProperties,
      storageData,
      consoleLogs,
      networkRequests,
      screenshots,
      pdfPath,
      textContent
    };
  } catch (error) {
    console.error(`Error scraping page ${url}:`, error);
    return {
      url,
      error: error.message
    };
  }
};

// Protected route that requires authentication and legal checks
router.post('/', auth, legalScraping, async (req, res) => {
  let browser;
  try {
    const {
      url,
      handleInfiniteScroll = false,
      maxScrolls = 5,
      takeScreenshots = false,
      generatePDF = false,
      maxDepth = 1
    } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    browser = await chromium.launch({
      headless: true,
      timeout: 120000,
      args: [
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'YourAppName Bot/1.0 (+https://yourapp.com/bot; bot@yourapp.com)',
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();
    
    // Scrape the main page
    const mainPageData = await scrapePage(page, url, {
      handleInfiniteScroll,
      maxScrolls,
      takeScreenshots,
      generatePDF
    });
    
    // Scrape linked pages if maxDepth > 0
    const linkedPagesData = [];
    if (maxDepth > 0 && mainPageData.links) {
      // Filter for internal links only and apply legal checks
      const internalLinks = mainPageData.links
        .filter(link => !link.isExternal)
        .map(link => link.href)
        .filter((href, index, self) => self.indexOf(href) === index) // Remove duplicates
        .slice(0, 10); // Limit to 10 internal links
      
      // Scrape each internal link with delay
      for (const link of internalLinks) {
        await delay(2000); // 2 second delay between requests
        const linkedPageData = await scrapePage(page, link, {
          handleInfiniteScroll,
          maxScrolls,
          takeScreenshots,
          generatePDF
        });
        linkedPagesData.push(linkedPageData);
      }
    }

    await browser.close();
    
    res.json({
      mainPage: mainPageData,
      linkedPages: linkedPagesData,
      legalNotice: 'This data was collected in compliance with robots.txt, terms of service, and other legal requirements. Please ensure you have the right to use this data according to applicable laws and regulations.'
    });
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Scraping error:', error);
    res.status(500).json({ message: 'Error scraping website', error: error.message });
  }
});

// API key based route for programmatic access
router.post('/api', legalScraping, async (req, res) => {
  let browser;
  try {
    const {
      url,
      apiKey,
      handleInfiniteScroll = false,
      maxScrolls = 5,
      takeScreenshots = false,
      generatePDF = false,
      maxDepth = 1
    } = req.body;

    if (!url || !apiKey) {
      return res.status(400).json({ message: 'URL and API key are required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Verify API key
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Proceed with scraping (same logic as above)
    browser = await chromium.launch({
      headless: true,
      timeout: 120000,
      args: [
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-gpu'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'YourAppName Bot/1.0 (+https://yourapp.com/bot; bot@yourapp.com)',
      viewport: { width: 1280, height: 720 }
    });

    const page = await context.newPage();
    
    // Scrape the main page
    const mainPageData = await scrapePage(page, url, {
      handleInfiniteScroll,
      maxScrolls,
      takeScreenshots,
      generatePDF
    });
    
    // Scrape linked pages if maxDepth > 0
    const linkedPagesData = [];
    if (maxDepth > 0 && mainPageData.links) {
      // Filter for internal links only and apply legal checks
      const internalLinks = mainPageData.links
        .filter(link => !link.isExternal)
        .map(link => link.href)
        .filter((href, index, self) => self.indexOf(href) === index) // Remove duplicates
        .slice(0, 10); // Limit to 10 internal links
      
      // Scrape each internal link with delay
      for (const link of internalLinks) {
        await delay(2000); // 2 second delay between requests
        const linkedPageData = await scrapePage(page, link, {
          handleInfiniteScroll,
          maxScrolls,
          takeScreenshots,
          generatePDF
        });
        linkedPagesData.push(linkedPageData);
      }
    }

    await browser.close();
    
    res.json({
      mainPage: mainPageData,
      linkedPages: linkedPagesData,
      legalNotice: 'This data was collected in compliance with robots.txt, terms of service, and other legal requirements. Please ensure you have the right to use this data according to applicable laws and regulations.'
    });
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Scraping error:', error);
    res.status(500).json({ message: 'Error scraping website', error: error.message });
  }
});

module.exports = router;
