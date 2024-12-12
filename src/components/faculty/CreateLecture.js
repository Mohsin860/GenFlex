import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, useToast,
  Container, Textarea, Progress
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import axios from 'axios';

const CreateLecture = () => {
  const [lectureTitle, setLectureTitle] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryPdfUrl, setSummaryPdfUrl] = useState('');
  const toast = useToast();

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

      console.log('Sending request to server...');
      const response = await axios.post('http://localhost:5000/api/lectures/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        }
      });

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
        // Remove 'api/lectures' from the URL as it's already included in summaryPdfUrl
        window.open(`http://localhost:5000${summaryPdfUrl}`, '_blank');
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
    <Container maxW="800px" py={8}>
      <VStack spacing={4} as="form" onSubmit={handleSubmit}>
        <Heading>Create Lecture</Heading>
        <FormControl isRequired>
          <FormLabel>Lecture Title</FormLabel>
          <Input 
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            disabled={isLoading}
            placeholder="Enter lecture title"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Upload PDF</FormLabel>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {file && (
            <Box mt={2} fontSize="sm" color="gray.600">
              Selected file: {file.name}
            </Box>
          )}
        </FormControl>
        {isLoading && (
          <Box w="100%">
            <Progress size="xs" isIndeterminate colorScheme="teal" />
            <Box mt={2} textAlign="center" fontSize="sm" color="gray.600">
              Processing PDF and generating summary...
            </Box>
          </Box>
        )}
        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isLoading}
          loadingText="Generating Lecture..."
          width="full"
          mt={4}
        >
          Create Lecture
        </Button>
        {summary && (
          <FormControl mt={4}>
            <FormLabel>Generated Lecture</FormLabel>
            <Textarea
              value={summary}
              readOnly
              height="200px"
              bg="gray.50"
              p={4}
            />
            {summaryPdfUrl && (
              <Button
                leftIcon={<DownloadIcon />}
                onClick={handleDownload}
                colorScheme="blue"
                mt={4}
                size="md"
                width="full"
              >
                Download Lecture Summary
              </Button>
            )}
          </FormControl>
        )}
      </VStack>
    </Container>
  );
};

export default CreateLecture;