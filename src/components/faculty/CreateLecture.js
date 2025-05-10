// src/components/faculty/CreateLecture.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  Textarea,
  Progress,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Icon,
  Text
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { FaFileUpload, FaBook } from 'react-icons/fa';
import axios from 'axios';

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryPdfUrl, setSummaryPdfUrl] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accentBg = useColorModeValue('purple.50', 'purple.900');

  // Helper function to get authentication headers
  const getAuthHeader = (isFormData = false) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : '';
    
    // For form data, we don't want to set Content-Type (browser will set it with boundary)
    if (isFormData) {
      return {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
    }
    
    // For regular JSON requests
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFile(file);
      console.log('File selected:', file.name);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!file || !lectureTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and a PDF file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('Preparing form data...');
      const formData = new FormData();
      formData.append('title', lectureTitle);
      formData.append('pdf', file);

      // Get auth headers for form data
      const authHeader = getAuthHeader(true);

      console.log('Sending request to server...');
      const response = await axios.post('/api/lectures/create', 
        formData, 
        {
          ...authHeader,
          timeout: 300000, // 5 minutes
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted + '%');
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        setSummary(response.data.summary);
        setSummaryPdfUrl(response.data.summaryPdfUrl);
        toast({
          title: "Lecture Created",
          description: "The lecture has been successfully created and summarized.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Reset form
        setLectureTitle('');
        setFile(null);
      } else {
        throw new Error(response.data.message || 'Failed to create lecture');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });

      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'An unexpected error occurred';

      toast({
        title: "Error",
        description: `Failed to create lecture: ${errorMessage}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Get auth token for request
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : '';
      
      // Include token in download request
      window.open(`${summaryPdfUrl}?token=${token}`, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download summary",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
      <Container maxW="container.xl">
        <Card bg={cardBg} boxShadow="md" mb={6}>
          <CardHeader bg={accentBg} py={4}>
            <Heading size="lg">Create Lecture</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} as="form" onSubmit={handleSubmit} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Lecture Title</FormLabel>
                <Input 
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter lecture title"
                  size="md"
                  boxShadow="sm"
                  borderRadius="md"
                />
              </FormControl>

              <Box p={6} borderWidth="1px" borderRadius="lg" borderStyle="dashed" borderColor="gray.300" bg="gray.50">
                <Flex direction="column" align="center">
                  <Icon as={FaBook} w={10} h={10} color="purple.500" mb={3} />
                  <Heading size="sm" mb={2}>Upload PDF Lecture Material</Heading>
                  <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                    Upload your lecture material in PDF format and we'll generate a summarized version
                  </Text>
                  <Input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange} 
                    disabled={isLoading}
                    hidden
                    id="lecture-pdf-upload"
                  />
                  <Button 
                    as="label"
                    htmlFor="lecture-pdf-upload"
                    leftIcon={<FaFileUpload />}
                    colorScheme="purple"
                    cursor="pointer"
                    mb={3}
                  >
                    Select PDF File
                  </Button>
                  {file && (
                    <Text fontSize="sm" mt={2}>
                      Selected: {file.name}
                    </Text>
                  )}
                </Flex>
              </Box>
              
              {isLoading && (
                <Box w="100%">
                  <Progress size="xs" isIndeterminate colorScheme="purple" />
                  <Text mt={2} textAlign="center" fontSize="sm" color="gray.600">
                    Processing PDF and generating summary... This may take a few minutes.
                  </Text>
                </Box>
              )}
              
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={isLoading}
                loadingText="Generating Lecture..."
                width="full"
                size="lg"
                mt={4}
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Create Lecture Summary
              </Button>
              
              {summary && (
                <Card borderWidth="1px" borderRadius="md" mt={6} boxShadow="md">
                  <CardHeader bg="purple.50" py={4}>
                    <Heading size="md">Generated Lecture Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <Textarea
                      value={summary}
                      readOnly
                      height="300px"
                      bg="white"
                      p={4}
                      borderRadius="md"
                      boxShadow="inner"
                    />
                    {summaryPdfUrl && (
                      <Button
                        leftIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        colorScheme="purple"
                        mt={4}
                        size="lg"
                        width="full"
                        boxShadow="md"
                        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                        transition="all 0.2s"
                      >
                        Download Lecture Summary
                      </Button>
                    )}
                  </CardBody>
                </Card>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default CreateLecture;