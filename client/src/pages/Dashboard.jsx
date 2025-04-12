import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
  HStack,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Image,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon
} from '@chakra-ui/react';
import { FaGlobe, FaCode, FaFileAlt, FaLink, FaImage, FaTable, FaDatabase, FaBug, FaCss3, FaFilePdf, FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      navigate('/');
    };

    window.addEventListener('popstate', handlePopState);
    // Push a new state to the history stack
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScrapedData(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/scrape',
        { 
          url,
          handleInfiniteScroll: true,
          maxScrolls: 3,
          takeScreenshots: true,
          generatePDF: true,
          maxDepth: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      setScrapedData(response.data);
      toast({
        title: 'Scraping successful',
        description: 'Website data has been extracted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Scraping error:', err);
      setError(err.response?.data?.message || 'An error occurred while scraping the website');
      toast({
        title: 'Scraping failed',
        description: err.response?.data?.message || 'An error occurred while scraping the website',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render metadata
  const renderMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaFileAlt} color="#8b5cf6" />
                <Text fontWeight="bold">Metadata</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Content</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(metadata).map(([name, content]) => (
                  <Tr key={name}>
                    <Td>{name}</Td>
                    <Td>{content}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render links
  const renderLinks = (links) => {
    if (!links || links.length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaLink} color="#8b5cf6" />
                <Text fontWeight="bold">Links ({links.length})</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Text</Th>
                  <Th>URL</Th>
                  <Th>Type</Th>
                </Tr>
              </Thead>
              <Tbody>
                {links.map((link, index) => {
                  // Check if the URL is a javascript: URL
                  const isJavaScriptUrl = link.href && link.href.startsWith('javascript:');
                  const safeHref = isJavaScriptUrl ? '#' : link.href;
                  
                  return (
                    <Tr key={index}>
                      <Td>{link.text}</Td>
                      <Td>
                        <Link 
                          href={safeHref} 
                          isExternal={!isJavaScriptUrl} 
                          color="#8b5cf6"
                          onClick={(e) => {
                            if (isJavaScriptUrl) {
                              e.preventDefault();
                              console.log('JavaScript URL blocked for security:', link.href);
                            }
                          }}
                        >
                          {link.href}
                        </Link>
                      </Td>
                      <Td>
                        <Badge colorScheme={link.isExternal ? 'red' : 'green'}>
                          {link.isExternal ? 'External' : 'Internal'}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render content structure
  const renderContentStructure = (structure) => {
    if (!structure) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaCode} color="#8b5cf6" />
                <Text fontWeight="bold">Content Structure</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Tabs>
              <TabList>
                <Tab>Headings</Tab>
                <Tab>Lists</Tab>
                <Tab>Images</Tab>
                <Tab>Forms</Tab>
                <Tab>Tables</Tab>
                <Tab>Iframes</Tab>
                <Tab>Shadow DOM</Tab>
              </TabList>
              
              <TabPanels>
                {/* Headings Panel */}
                <TabPanel>
                  {Object.entries(structure.headings).map(([level, headings]) => (
                    <Box key={level} mb={4}>
                      <Text fontWeight="bold" mb={2}>{level.toUpperCase()}</Text>
                      <VStack align="start" spacing={1}>
                        {headings.map((heading, index) => (
                          <Text key={index}>{heading.text}</Text>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </TabPanel>
                
                {/* Lists Panel */}
                <TabPanel>
                  <VStack align="start" spacing={4}>
                    {structure.lists.map((list, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold" mb={2}>
                          {list.type.toUpperCase()} List
                          {list.id && <Badge ml={2}>{list.id}</Badge>}
                        </Text>
                        <VStack align="start" spacing={1}>
                          {list.items.map((item, itemIndex) => (
                            <Text key={itemIndex}>{item}</Text>
                          ))}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                
                {/* Images Panel */}
                <TabPanel>
                  <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
                    {structure.images.map((img, index) => (
                      <GridItem key={index} p={3} borderWidth="1px" borderRadius="md">
                        {img.src && (
                          <Image 
                            src={img.src} 
                            alt={img.alt || 'Image'} 
                            fallback={<Spinner />}
                            borderRadius="md"
                            mb={2}
                          />
                        )}
                        <Text fontSize="sm" fontWeight="bold">{img.alt || 'No alt text'}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {img.width}x{img.height}px
                        </Text>
                      </GridItem>
                    ))}
                  </Grid>
                </TabPanel>
                
                {/* Forms Panel */}
                <TabPanel>
                  <VStack align="start" spacing={4}>
                    {structure.forms.map((form, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold" mb={2}>
                          Form: {form.action || 'No action'}
                          {form.id && <Badge ml={2}>{form.id}</Badge>}
                        </Text>
                        <Text fontSize="sm" mb={2}>Method: {form.method || 'GET'}</Text>
                        
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Type</Th>
                              <Th>Name</Th>
                              <Th>Value</Th>
                              <Th>Required</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {form.inputs.map((input, inputIndex) => (
                              <Tr key={inputIndex}>
                                <Td>{input.type}</Td>
                                <Td>{input.name}</Td>
                                <Td>{input.value || '-'}</Td>
                                <Td>{input.required ? 'Yes' : 'No'}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                
                {/* Tables Panel */}
                <TabPanel>
                  <VStack align="start" spacing={4}>
                    {structure.tables.map((table, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold" mb={2}>
                          Table
                          {table.id && <Badge ml={2}>{table.id}</Badge>}
                        </Text>
                        
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              {table.headers.map((header, headerIndex) => (
                                <Th key={headerIndex}>{header}</Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {table.rows.map((row, rowIndex) => (
                              <Tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <Td key={cellIndex}>{cell}</Td>
                                ))}
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                
                {/* Iframes Panel */}
                <TabPanel>
                  <VStack align="start" spacing={4}>
                    {structure.iframes.map((iframe, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold" mb={2}>
                          Iframe
                          {iframe.id && <Badge ml={2}>{iframe.id}</Badge>}
                        </Text>
                        <Text fontSize="sm">Source: {iframe.src}</Text>
                        <Text fontSize="sm">Dimensions: {iframe.width}x{iframe.height}</Text>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                
                {/* Shadow DOM Panel */}
                <TabPanel>
                  <VStack align="start" spacing={4}>
                    {structure.shadowDOM.map((element, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold" mb={2}>
                          {element.tagName}
                          {element.id && <Badge ml={2}>{element.id}</Badge>}
                        </Text>
                        
                        <Text fontSize="sm" mb={2}>Shadow Content:</Text>
                        <Box pl={4} borderLeftWidth="2px" borderColor="gray.300">
                          {element.shadowContent.map((content, contentIndex) => (
                            <Text key={contentIndex} fontSize="sm">
                              {content.tagName}: {content.text}
                            </Text>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render storage data
  const renderStorageData = (storageData) => {
    if (!storageData) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaDatabase} color="#8b5cf6" />
                <Text fontWeight="bold">Storage Data</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Tabs>
              <TabList>
                <Tab>Local Storage</Tab>
                <Tab>Session Storage</Tab>
                <Tab>Cookies</Tab>
              </TabList>
              
              <TabPanels>
                {/* Local Storage Panel */}
                <TabPanel>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Key</Th>
                        <Th>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(storageData.localStorage).map(([key, value]) => (
                        <Tr key={key}>
                          <Td>{key}</Td>
                          <Td>
                            <Code>{value}</Code>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TabPanel>
                
                {/* Session Storage Panel */}
                <TabPanel>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Key</Th>
                        <Th>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(storageData.sessionStorage).map(([key, value]) => (
                        <Tr key={key}>
                          <Td>{key}</Td>
                          <Td>
                            <Code>{value}</Code>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TabPanel>
                
                {/* Cookies Panel */}
                <TabPanel>
                  <Text>{storageData.cookies || 'No cookies found'}</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render network requests
  const renderNetworkRequests = (networkRequests) => {
    if (!networkRequests || networkRequests.length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaGlobe} color="#8b5cf6" />
                <Text fontWeight="bold">Network Requests ({networkRequests.length})</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>URL</Th>
                  <Th>Method</Th>
                  <Th>Resource Type</Th>
                </Tr>
              </Thead>
              <Tbody>
                {networkRequests.map((request, index) => {
                  // Check if the URL is a javascript: URL
                  const isJavaScriptUrl = request.url && request.url.startsWith('javascript:');
                  const safeUrl = isJavaScriptUrl ? '#' : request.url;
                  
                  return (
                    <Tr key={index}>
                      <Td>
                        <Link 
                          href={safeUrl} 
                          isExternal={!isJavaScriptUrl} 
                          color="#8b5cf6"
                          onClick={(e) => {
                            if (isJavaScriptUrl) {
                              e.preventDefault();
                              console.log('JavaScript URL blocked for security:', request.url);
                            }
                          }}
                        >
                          {request.url}
                        </Link>
                      </Td>
                      <Td>{request.method}</Td>
                      <Td>{request.resourceType}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render screenshots
  const renderScreenshots = (screenshots) => {
    if (!screenshots) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <HStack>
                  <Icon as={FaCamera} color="#8b5cf6" />
                  <Text fontWeight="bold">Screenshots</Text>
                </HStack>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack spacing={4} align="stretch">
              {screenshots.fullPage && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Full Page Screenshot</Text>
                  <Image 
                    src={`data:image/png;base64,${screenshots.fullPage}`}
                    alt="Full page screenshot"
                    borderRadius="md"
                    maxH="500px"
                    objectFit="contain"
                  />
                </Box>
              )}
              
              {screenshots.viewport && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Viewport Screenshot</Text>
                  <Image 
                    src={`data:image/png;base64,${screenshots.viewport}`}
                    alt="Viewport screenshot"
                    borderRadius="md"
                    maxH="500px"
                    objectFit="contain"
                  />
                </Box>
              )}
              
              {screenshots.elements && screenshots.elements.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Element Screenshots</Text>
                  <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
                    {screenshots.elements.map((element, index) => (
                      <GridItem key={index}>
                        <Box borderWidth="1px" borderRadius="md" p={2}>
                          <Text fontSize="sm" mb={2} noOfLines={1}>{element.selector}</Text>
                          <Image 
                            src={`data:image/png;base64,${element.data}`}
                            alt={`Element screenshot ${index + 1}`}
                            borderRadius="md"
                            maxH="200px"
                            objectFit="contain"
                          />
                        </Box>
                      </GridItem>
                    ))}
                  </Grid>
                </Box>
              )}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render PDF
  const renderPDF = (pdfData) => {
    if (!pdfData) return null;
    
    return (
      <Box p={3} borderWidth="1px" borderRadius="md" width="100%">
        <HStack>
          <Icon as={FaFilePdf} color="#8b5cf6" />
          <Text fontWeight="bold">PDF Export</Text>
        </HStack>
        <Button
          onClick={() => {
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${pdfData}`;
            link.download = 'webpage.pdf';
            link.click();
          }}
          colorScheme="purple"
          variant="link"
          mt={2}
        >
          Download PDF of the page
        </Button>
      </Box>
    );
  };

  // Helper function to render console logs
  const renderConsoleLogs = (consoleLogs) => {
    if (!consoleLogs || consoleLogs.length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaBug} color="#8b5cf6" />
                <Text fontWeight="bold">Console Logs ({consoleLogs.length})</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack align="start" spacing={2}>
              {consoleLogs.map((log, index) => (
                <Box 
                  key={index} 
                  p={2} 
                  borderWidth="1px" 
                  borderRadius="md" 
                  width="100%"
                  bg={log.type === 'error' ? 'red.50' : log.type === 'warning' ? 'yellow.50' : 'gray.50'}
                >
                  <HStack>
                    <Badge colorScheme={
                      log.type === 'error' ? 'red' : 
                      log.type === 'warning' ? 'yellow' : 
                      log.type === 'info' ? 'blue' : 'gray'
                    }>
                      {log.type}
                    </Badge>
                    <Text fontSize="sm">{log.text}</Text>
                  </HStack>
                  {log.location && (
                    <Text fontSize="xs" color="gray.500">
                      {log.location.url}:{log.location.lineNumber}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render CSS properties
  const renderCSSProperties = (cssProperties) => {
    if (!cssProperties || Object.keys(cssProperties).length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaCss3} color="#8b5cf6" />
                <Text fontWeight="bold">CSS Properties</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Tabs>
              <TabList>
                <Tab>Selectors</Tab>
                <Tab>Styles</Tab>
              </TabList>
              
              <TabPanels>
                {/* Selectors Panel */}
                <TabPanel>
                  <VStack align="start" spacing={2}>
                    {Object.keys(cssProperties).map((selector, index) => (
                      <Box key={index} p={2} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold">{selector}</Text>
                        <Text fontSize="sm">
                          Position: {cssProperties[selector].position.top}px, {cssProperties[selector].position.left}px
                        </Text>
                        <Text fontSize="sm">
                          Size: {cssProperties[selector].position.width}px x {cssProperties[selector].position.height}px
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
                
                {/* Styles Panel */}
                <TabPanel>
                  <VStack align="start" spacing={2}>
                    {Object.keys(cssProperties).map((selector, index) => (
                      <Box key={index} p={2} borderWidth="1px" borderRadius="md" width="100%">
                        <Text fontWeight="bold">{selector}</Text>
                        <Code p={2} borderRadius="md" width="100%" whiteSpace="pre-wrap">
                          {JSON.stringify(cssProperties[selector].styles, null, 2)}
                        </Code>
                      </Box>
                    ))}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render structured data
  const renderStructuredData = (structuredData) => {
    if (!structuredData || structuredData.length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaCode} color="#8b5cf6" />
                <Text fontWeight="bold">Structured Data ({structuredData.length})</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack align="start" spacing={4}>
              {structuredData.map((data, index) => (
                <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                  <Text fontWeight="bold" mb={2}>{data.type}</Text>
                  <Code p={2} borderRadius="md" width="100%" whiteSpace="pre-wrap">
                    {JSON.stringify(data.data, null, 2)}
                  </Code>
                </Box>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render text content
  const renderTextContent = (textContent) => {
    if (!textContent || textContent.length === 0) return null;
    
    return (
      <Accordion allowMultiple>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaFileAlt} color="#8b5cf6" />
                <Text fontWeight="bold">Text Content ({textContent.length} nodes)</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <Box p={3} borderWidth="1px" borderRadius="md" maxH="300px" overflowY="auto">
              {textContent.map((text, index) => (
                <Text key={index} mb={1}>{text}</Text>
              ))}
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };

  // Helper function to render page data
  const renderPageData = (pageData, title = 'Page Data') => {
    if (!pageData) return null;
    
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" mb={4} bg="white" boxShadow="md">
        <Heading size="md" mb={4} color="black">{title}</Heading>
        
        <VStack align="stretch" spacing={4}>
          <Box>
            <Text fontWeight="bold" color="black">URL:</Text>
            {/* Check if the URL is a javascript: URL */}
            {pageData.url && pageData.url.startsWith('javascript:') ? (
              <Text color="red.500">JavaScript URL (blocked for security)</Text>
            ) : (
              <Link href={pageData.url} isExternal color="#8b5cf6">
                {pageData.url}
              </Link>
            )}
          </Box>
          
          {pageData.title && (
            <Box>
              <Text fontWeight="bold" color="black">Title:</Text>
              <Text>{pageData.title}</Text>
            </Box>
          )}
          
          {pageData.description && (
            <Box>
              <Text fontWeight="bold" color="black">Description:</Text>
              <Text>{pageData.description}</Text>
            </Box>
          )}
          
          {pageData.error && (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{pageData.error}</AlertDescription>
              </Box>
            </Alert>
          )}
          
          {pageData.metadata && renderMetadata(pageData.metadata)}
          {pageData.structuredData && renderStructuredData(pageData.structuredData)}
          {pageData.contentStructure && renderContentStructure(pageData.contentStructure)}
          {pageData.links && renderLinks(pageData.links)}
          {pageData.cssProperties && renderCSSProperties(pageData.cssProperties)}
          {pageData.storageData && renderStorageData(pageData.storageData)}
          {pageData.consoleLogs && renderConsoleLogs(pageData.consoleLogs)}
          {pageData.networkRequests && renderNetworkRequests(pageData.networkRequests)}
          {pageData.screenshots && renderScreenshots(pageData.screenshots)}
          {pageData.pdfPath && renderPDF(pageData.pdfPath)}
          {pageData.textContent && renderTextContent(pageData.textContent)}
        </VStack>
      </Box>
    );
  };

  return (
    <Box bg="linear-gradient(to bottom, #1e293b, #0f172a)" minH="100vh" py={8}>
      <Container maxW="100%" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading 
              mb={4} 
              fontSize={{base: "28px", md: "36px"}}
              bgGradient="linear(to-r, #8b5cf6, #d946ef)"
              bgClip="text"
            >
              Dashboard
            </Heading>
            <Text fontSize="lg" color="#cbd5e1">
              Welcome, {user?.name || 'User'}!
            </Text>
          </Box>

          <Container maxW="600px" px={4}>
            <VStack spacing={6} align="stretch" width="100%">
              <Box 
                p={6} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg="white" 
                boxShadow="md"
                className="contact-section"
                width="100%"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.02)" }}
              >
                <Heading size="md" mb={4} color="black">Need API Access?</Heading>
                <Text fontSize="sm" color="gray.500">
                  If you need access to the API, please <Link color="#8b5cf6" href="/contact">contact us</Link>.
                </Text>
              </Box>

              <Box 
                p={6} 
                borderWidth="1px" 
                borderRadius="lg" 
                bg="white" 
                boxShadow="md"
                className="scrape-section"
                width="100%"
                transition="transform 0.3s ease"
                _hover={{ transform: "scale(1.02)" }}
              >
                <Heading size="md" mb={4} color="black">Scrape Website</Heading>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color="black">Website URL</FormLabel>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        borderColor="#cbd5e1"
                        _focus={{ borderColor: "#8b5cf6", boxShadow: "0 0 0 1px #8b5cf6" }}
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      bg="linear-gradient(135deg, #8b5cf6, #d946ef)"
                      color="white"
                      border="none"
                      px="30px"
                      py="12px"
                      fontSize="16px"
                      fontWeight="600"
                      isLoading={loading}
                      loadingText="Scraping..."
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "0 5px 15px rgba(139, 92, 246, 0.4)",
                        bg: "linear-gradient(135deg, #4c1d95, #831843)",
                        color: "white",
                        textShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
                      }}
                    >
                      Scrape Website
                    </Button>
                  </Stack>
                </form>
              </Box>
            </VStack>
          </Container>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          {scrapedData && (
            <Box className="results-section">
              <Heading 
                size="lg" 
                mb={6} 
                textAlign="center"
                color="white"
                fontWeight="bold"
                position="relative"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "120px",
                  height: "4px",
                  background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)",
                  borderRadius: "2px"
                }}
                _after={{
                  content: '""',
                  position: "absolute",
                  bottom: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "120px",
                  height: "4px",
                  background: "linear-gradient(90deg, transparent, #d946ef, transparent)",
                  borderRadius: "2px"
                }}
                bgGradient="linear(to-r, #8b5cf6, #d946ef)"
                bgClip="text"
                transition="all 0.3s ease"
                _hover={{
                  transform: "scale(1.02)"
                }}
              >
                ScrapeSquad Results
              </Heading>
              
              {renderPageData(scrapedData.mainPage, 'Main Page')}
              
              {scrapedData.linkedPages && scrapedData.linkedPages.length > 0 && (
                <Box>
                  <Heading 
                    size="sm" 
                    mb={4} 
                    textAlign="center"
                    color="black"
                  >
                    Linked Pages
                  </Heading>
                  {scrapedData.linkedPages.map((page, index) => (
                    <Box key={index}>
                      {renderPageData(page, `Linked Page ${index + 1}`)}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </VStack>
      </Container>
      <Box textAlign="center" mt={8} pb={4}>
        <Box 
          as="a" 
          href="https://onranko.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          display="inline-flex"
          alignItems="center"
          gap={2}
          _hover={{ opacity: 1 }}
          opacity={0.8}
        >
          <Image 
            src="/Logo-small.png" 
            alt="OnRanko Logo" 
            height="32px" 
            width="auto"
            objectFit="contain"
          />
          <Text 
            fontSize="md" 
            color="#cbd5e1"
            bgGradient="linear(to-r, #8b5cf6, #d946ef)"
            bgClip="text"
            fontWeight="medium"
          >
            Powered by OnRanko
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 