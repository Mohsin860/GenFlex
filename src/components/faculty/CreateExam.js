// src/components/faculty/CreateExam.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Textarea,
  useToast,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Container,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Flex,
  Icon,
  Text,
  HStack
} from '@chakra-ui/react';
import { DownloadIcon, AddIcon, TimeIcon } from '@chakra-ui/icons';
import { FaFileAlt, FaFileUpload } from 'react-icons/fa';
import axios from 'axios';

const CreateExam = () => {
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState('essay');
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [examContent, setExamContent] = useState('');
  const [examSolution, setExamSolution] = useState('');
  const [isExamFinalized, setIsExamFinalized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [examId, setExamId] = useState(null);
  const [duration, setDuration] = useState(120); // Default 2 hours in minutes
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accentBg = useColorModeValue('teal.50', 'teal.900');

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

  const handleAddQuestion = () => {
    if (question.trim() !== '') {
      const newQuestions = [...questions, { question: question.trim(), type: 'manual' }];
      setQuestions(newQuestions);
      setQuestion('');
      const content = newQuestions.map((q, idx) => `Question ${idx + 1}: ${q.question}`).join('\n\n');
      setExamContent(content);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      toast({
        title: "PDF Selected",
        description: `File "${file.name}" has been selected.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGenerateExam = async () => {
    if (!pdfFile || !examTitle) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and a PDF file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('title', examTitle);
      formData.append('numQuestions', numQuestions);
      formData.append('examType', examType);
      formData.append('duration', duration); // Add duration

      // Get auth headers without content-type (browser will set it with boundary)
      const authHeader = getAuthHeader(true);
      
      const response = await axios.post(
        '/api/exams/create', 
        formData, 
        authHeader
      );

      if (response.data.success) {
        setExamId(response.data.examId);
        const formattedQuestions = response.data.questions.map((q, idx) => (
          `Question ${idx + 1}: ${q.question}`
        )).join('\n\n');
        
        setExamContent(formattedQuestions);
        setQuestions(response.data.questions);

        toast({
          title: "Exam Generated",
          description: "Questions have been generated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate exam. Ensure you're logged in.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAndDownload = async () => {
    if (!examContent.trim()) {
      toast({
        title: "No Content",
        description: "Please generate or add questions first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      // Parse the edited content back into questions array
      const editedQuestions = examContent.split('\n\n').map((q, index) => {
        const questionText = q.replace(`Question ${index + 1}:`, '').trim();
        return {
          question: questionText,
          answer: questions[index]?.answer || '',
          context: questions[index]?.context || ''
        };
      });

      const response = await axios.post(
        '/api/exams/update-and-download', 
        {
          examId,
          title: examTitle,
          questions: editedQuestions,
          content: examContent,
          type: examType,
          duration: duration // Add duration
        }, 
        { 
          responseType: 'blob',
          headers: getAuthHeader().headers
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${examTitle || 'exam'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Success",
        description: "Exam has been downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to update and download exam",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
      <Container maxW="container.xl">
        <Card bg={cardBg} boxShadow="md" mb={6}>
          <CardHeader bg={accentBg} py={4}>
            <Heading size="lg">Create Essay-Based Exam</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem colSpan={{ base: 2, md: 1 }}>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium">Exam Title</FormLabel>
                    <Input 
                      value={examTitle} 
                      onChange={(e) => setExamTitle(e.target.value)} 
                      placeholder="Enter exam title"
                      size="md"
                      isReadOnly={isExamFinalized}
                      boxShadow="sm"
                      borderRadius="md"
                    />
                  </FormControl>
                  
                  <HStack>
                    <FormControl>
                      <FormLabel fontWeight="medium">Number of Questions</FormLabel>
                      <NumberInput 
                        min={1} 
                        max={20} 
                        value={numQuestions}
                        onChange={(valueString) => setNumQuestions(parseInt(valueString))}
                        isDisabled={isExamFinalized}
                        size="md"
                        boxShadow="sm"
                        borderRadius="md"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel fontWeight="medium">
                        <Flex align="center">
                          <Icon as={TimeIcon} mr={1} />
                          Duration (Minutes)
                        </Flex>
                      </FormLabel>
                      <NumberInput 
                        min={10} 
                        max={300} 
                        value={duration}
                        onChange={(valueString) => setDuration(parseInt(valueString))}
                        isDisabled={isExamFinalized}
                        size="md"
                        boxShadow="sm"
                        borderRadius="md"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel fontWeight="medium">Add Question Manually (Optional)</FormLabel>
                    <Textarea 
                      value={question} 
                      onChange={(e) => setQuestion(e.target.value)} 
                      placeholder="Enter your question here"
                      isReadOnly={isExamFinalized}
                      size="md"
                      boxShadow="sm"
                      borderRadius="md"
                      minH="100px"
                    />
                    <Button 
                      mt={3} 
                      onClick={handleAddQuestion} 
                      isDisabled={isExamFinalized || !question.trim()}
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      size="md"
                    >
                      Add Question
                    </Button>
                  </FormControl>
                  
                  <Box p={6} borderWidth="1px" borderRadius="lg" borderStyle="dashed" borderColor="gray.300" bg="gray.50">
                    <Flex direction="column" align="center">
                      <Icon as={FaFileUpload} w={10} h={10} color="teal.500" mb={3} />
                      <Heading size="sm" mb={2}>Upload PDF for AI Question Generation</Heading>
                      <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                        Upload your lecture material in PDF format and we'll generate relevant questions
                      </Text>
                      <Input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange} 
                        isDisabled={isExamFinalized}
                        hidden
                        id="pdf-upload"
                      />
                      <Button 
                        as="label"
                        htmlFor="pdf-upload"
                        leftIcon={<FaFileAlt />}
                        colorScheme="teal"
                        cursor="pointer"
                        mb={3}
                      >
                        Select PDF File
                      </Button>
                      {pdfFile && (
                        <Text fontSize="sm" mt={2}>
                          Selected: {pdfFile.name}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                  
                  <Button 
                    onClick={handleGenerateExam} 
                    colorScheme="teal" 
                    size="lg"
                    isDisabled={isExamFinalized || isLoading || !pdfFile}
                    isLoading={isLoading}
                    loadingText="Generating Questions"
                    leftIcon={<Icon as={FaFileUpload} />}
                    boxShadow="md"
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                  >
                    Generate Questions
                  </Button>
                  
                  <Button 
                    onClick={handleUpdateAndDownload}
                    leftIcon={<DownloadIcon />}
                    colorScheme="blue"
                    width="full"
                    size="lg"
                    isDisabled={!examContent || isLoading}
                    isLoading={isLoading}
                    loadingText="Downloading"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    mt={3}
                  >
                    Download Exam
                  </Button>
                </VStack>
              </GridItem>
              
              <GridItem colSpan={{ base: 2, md: 1 }}>
                <VStack spacing={6} align="stretch" height="100%">
                  <FormControl flex="1">
                    <FormLabel fontWeight="medium">Generated Questions (Editable)</FormLabel>
                    <Textarea
                      value={examContent}
                      onChange={(e) => setExamContent(e.target.value)}
                      height="400px"
                      isReadOnly={isExamFinalized}
                      placeholder="Generated questions will appear here..."
                      boxShadow="sm"
                      borderRadius="md"
                    />
                  </FormControl>
                </VStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default CreateExam;