import { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  useToast,
  Select,
  FormHelperText,
} from '@chakra-ui/react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
    expectedVolume: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('/api/contact', formData);
      toast({
        title: 'Request sent successfully!',
        description: 'We will review your API access request and get back to you soon.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({ name: '', email: '', company: '', useCase: '', expectedVolume: '', message: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send request. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            Request API Access
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Fill out this form to request access to our API. We'll review your request and get back to you shortly.
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Company/Organization</FormLabel>
              <Input
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company or organization name"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Intended Use Case</FormLabel>
              <Select
                name="useCase"
                value={formData.useCase}
                onChange={handleChange}
                placeholder="Select your use case"
              >
                <option value="data-analysis">Data Analysis</option>
                <option value="market-research">Market Research</option>
                <option value="content-aggregation">Content Aggregation</option>
                <option value="price-monitoring">Price Monitoring</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Expected Monthly Request Volume</FormLabel>
              <Select
                name="expectedVolume"
                value={formData.expectedVolume}
                onChange={handleChange}
                placeholder="Select expected volume"
              >
                <option value="low">Low (0-1,000 requests)</option>
                <option value="medium">Medium (1,000-10,000 requests)</option>
                <option value="high">High (10,000-100,000 requests)</option>
                <option value="enterprise">Enterprise (100,000+ requests)</option>
              </Select>
              <FormHelperText>This helps us provide appropriate rate limits and pricing</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Additional Information</FormLabel>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please provide any additional details about your use case, specific requirements, or questions"
                rows={6}
              />
            </FormControl>

            <Button
              type="submit"
              borderWidth="2px"
              borderColor="black"
              color="black"
              bg="transparent"
              size="lg"
              width="full"
              mt={4}
              isLoading={isLoading}
              loadingText="Sending..."
              _hover={{
                bg: "black",
                color: "white"
              }}
            >
              Submit API Access Request
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Contact;
