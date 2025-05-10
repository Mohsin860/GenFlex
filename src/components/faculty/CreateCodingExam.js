// src/components/faculty/CreateCodingExam.js
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
  HStack,
  Container,
  Flex,
  ButtonGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Text,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { FaCode, FaCalculator, FaRandom, FaPuzzlePiece, FaDownload, FaSave, FaClock } from 'react-icons/fa';

const CreateCodingExam = () => {
  const [examTitle, setExamTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsText, setQuestionsText] = useState('');
  const [currentSolution, setCurrentSolution] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentExamId, setCurrentExamId] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState(null);
  const [duration, setDuration] = useState(); // Default 2 hours in minutes
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accentBg = useColorModeValue('blue.50', 'blue.900');

  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : '';
    console.log('Sending token:', token.substring(0, 20) + '...'); // Log the first part of the token
    return {
      headers: {
        'Content-Type': 'application/json',  // Add this line
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const handleGenerateMediumQuestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a prompt for question generation",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (numQuestions < 1 || numQuestions > 15) {
      toast({
        title: "Invalid Number of Questions",
        description: "Please enter a number between 1 and 15",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setQuestionType('medium');
    setIsLoading(true);
    try {
      const response = await axios.post('/api/coding-exams/generate', {
        prompt,
        difficulty: 'medium',
        title: examTitle,
        numQuestions: parseInt(numQuestions),
        duration: duration // Add duration
      }, getAuthHeader());

      if (response.data.success && response.data.questions) {
        const formattedQuestions = response.data.questions.map((q, index) => ({
          ...q,
          question: `Question ${index + 1}:\n${q.question}\n\n`
        }));

        setQuestions(formattedQuestions);
        const allQuestionsText = formattedQuestions
          .map(q => q.question)
          .join('\n');
        setQuestionsText(allQuestionsText);

        if (formattedQuestions.length > 0) {
          setCurrentSolution(formattedQuestions[0].solution || '');
        }

        if (response.data.examId) {
          setCurrentExamId(response.data.examId);
        }

        toast({
          title: "Success",
          description: "Questions generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate questions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setQuestionType(null);
    }
  };

  const handleGenerateDiverseCodeQuestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a prompt for question generation",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (numQuestions < 1 || numQuestions > 15) {
      toast({
        title: "Invalid Number of Questions",
        description: "Please enter a number between 1 and 15",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setQuestionType('diverse');
    setIsLoading(true);
    try {
      const response = await axios.post('/api/coding-exams/generate-diverse', {
        prompt,
        title: examTitle,
        numQuestions: parseInt(numQuestions),
        duration: duration // Add duration
      }, getAuthHeader());

      if (response.data.success && response.data.questions) {
        const formattedQuestions = response.data.questions.map((q, index) => ({
          ...q,
          question: `Question ${index + 1}:\n${q.question}\n\n`
        }));

        setQuestions(formattedQuestions);
        const allQuestionsText = formattedQuestions
          .map(q => q.question)
          .join('\n');
        setQuestionsText(allQuestionsText);

        if (formattedQuestions.length > 0) {
          setCurrentSolution(formattedQuestions[0].solution || '');
        }

        if (response.data.examId) {
          setCurrentExamId(response.data.examId);
        }

        toast({
          title: "Success",
          description: "Diverse code questions generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate diverse code questions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setQuestionType(null);
    }
  };


  const handleGenerateMathQuestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a prompt for question generation",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (numQuestions < 1 || numQuestions > 15) {
      toast({
        title: "Invalid Number of Questions",
        description: "Please enter a number between 1 and 15",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setQuestionType('math');
    setIsLoading(true);
    try {
      const response = await axios.post('/api/coding-exams/generate-math', {
        prompt,
        title: examTitle,
        numQuestions: parseInt(numQuestions),
        duration: duration // Add duration
      }, getAuthHeader());

      if (response.data.success && response.data.questions) {
        const formattedQuestions = response.data.questions.map((q, index) => ({
          ...q,
          question: `Question ${index + 1}:\n${q.question}\n\n`
        }));

        setQuestions(formattedQuestions);
        const allQuestionsText = formattedQuestions
          .map(q => q.question)
          .join('\n');
        setQuestionsText(allQuestionsText);

        if (formattedQuestions.length > 0) {
          setCurrentSolution(formattedQuestions[0].solution || '');
        }

        if (response.data.examId) {
          setCurrentExamId(response.data.examId);
        }

        toast({
          title: "Success",
          description: "Math questions generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate math questions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setQuestionType(null);
    }
  };


  const handleGenerateComplexQuestions = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a prompt for question generation",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (numQuestions < 1 || numQuestions > 15) {
      toast({
        title: "Invalid Number of Questions",
        description: "Please enter a number between 1 and 15",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setQuestionType('complex');
    setIsLoading(true);
    try {
      const response = await axios.post('/api/coding-exams/generate-complex', {
        prompt,
        title: examTitle,
        numQuestions: parseInt(numQuestions),
        duration: duration // Add duration
      }, getAuthHeader());

      if (response.data.success && response.data.questions) {
        const formattedQuestions = response.data.questions.map((q, index) => ({
          ...q,
          question: `Question ${index + 1}:\n${q.question}\n\n`
        }));

        setQuestions(formattedQuestions);
        const allQuestionsText = formattedQuestions
          .map(q => q.question)
          .join('\n');
        setQuestionsText(allQuestionsText);

        if (formattedQuestions.length > 0) {
          setCurrentSolution(formattedQuestions[0].solution || '');
        }

        if (response.data.examId) {
          setCurrentExamId(response.data.examId);
        }

        toast({
          title: "Success",
          description: "Complex questions generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate complex questions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setQuestionType(null);
    }
  };

  const handleQuestionTextChange = (value) => {
    setQuestionsText(value);
    const questionParts = value.split('Question').filter(part => part.trim());
    const updatedQuestions = questionParts.map((part, index) => ({
      ...questions[index],
      question: `Question${part}`
    }));
    setQuestions(updatedQuestions);
  };

  const handleSolutionChange = (value) => {
    setCurrentSolution(value);
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      solution: value
    };
    setQuestions(updatedQuestions);
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
    setCurrentSolution(questions[index].solution || '');
  };

  const handleSave = async () => {
    if (!questions.length || !examTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please ensure you have a title and generated questions",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/coding-exams/save', {
        examId: currentExamId,
        title: examTitle,
        questions: questions,
        editedContent: questionsText,
        duration: duration // Add duration
      }, getAuthHeader());

      if (response.data.success) {
        setCurrentExamId(response.data.examId || currentExamId);
        toast({
          title: "Success",
          description: "Exam saved successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save exam",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!questions.length) {
      toast({
        title: "No Questions",
        description: "Please generate questions first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      if (!currentExamId) {
        await handleSave();
      }

      const response = await axios.post('/api/coding-exams/download',
        {
          examId: currentExamId,
          title: examTitle,
          questions: questions,
          duration: duration // Add duration
        },
        {
          ...getAuthHeader(),
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${examTitle || 'coding_exam'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: "Success",
        description: "Exam downloaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download exam",
        status: "error",
        duration: 3000,
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
            <Heading size="lg">Create Technical Exam</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Flex gap={6} direction={{ base: "column", lg: "row" }}>
                <FormControl flex="2">
                  <FormLabel fontWeight="medium">Exam Title</FormLabel>
                  <Input
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Enter exam title"
                    size="md"
                    boxShadow="sm"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl flex="2">
                  <FormLabel fontWeight="medium">Prompt</FormLabel>
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt (e.g., 'binary search, graph algorithms')"
                    size="md"
                    boxShadow="sm"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl flex="1">
                  <FormLabel fontWeight="medium">Number of Questions</FormLabel>
                  <NumberInput
                    value={numQuestions}
                    onChange={(valueString) => setNumQuestions(valueString)}
                    min={1}
                    max={15}
                    defaultValue={5}
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
              </Flex>

              <FormControl>
                <FormLabel fontWeight="medium">
                  <Flex align="center">
                    <Icon as={FaClock} mr={2} />
                    Exam Duration (Minutes)
                  </Flex>
                </FormLabel>
                <NumberInput
                  value={duration}
                  onChange={(valueString) => setDuration(parseInt(valueString))}
                  min={10}
                  max={300}
                  size="md"
                  boxShadow="sm"
                  borderRadius="md"
                  width={{ base: "100%", md: "200px" }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Time students will have to complete the exam
                </Text>
              </FormControl>

              <Tabs variant="soft-rounded" colorScheme="blue" mt={4}>
                <TabList>
                  <Tab>
                    <Flex align="center">
                      <Icon as={FaCode} mr={2} />
                      <Text>Coding</Text>
                    </Flex>
                  </Tab>
                  <Tab>
                    <Flex align="center">
                      <Icon as={FaPuzzlePiece} mr={2} />
                      <Text>Complex</Text>
                    </Flex>
                  </Tab>
                  <Tab>
                    <Flex align="center">
                      <Icon as={FaCalculator} mr={2} />
                      <Text>Math</Text>
                    </Flex>
                  </Tab>
                  <Tab>
                    <Flex align="center">
                      <Icon as={FaRandom} mr={2} />
                      <Text>Diverse</Text>
                    </Flex>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
                      <Text>Generate medium difficulty coding questions based on your prompt.</Text>
                    </Box>
                    <Button
                      colorScheme="blue"
                      onClick={handleGenerateMediumQuestions}
                      isLoading={isLoading && questionType === 'medium'}
                      loadingText="Generating"
                      width="full"
                      size="lg"
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Generate Coding Questions
                    </Button>
                  </TabPanel>
                  <TabPanel>
                    <Box bg="purple.50" p={4} borderRadius="md" mb={4}>
                      <Text>Generate complex, multi-part programming questions requiring deeper analysis.</Text>
                    </Box>
                    <Button
                      colorScheme="purple"
                      onClick={handleGenerateComplexQuestions}
                      isLoading={isLoading && questionType === 'complex'}
                      loadingText="Generating"
                      width="full"
                      size="lg"
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Generate Complex Questions
                    </Button>
                  </TabPanel>
                  <TabPanel>
                    <Box bg="green.50" p={4} borderRadius="md" mb={4}>
                      <Text>Generate mathematics questions with step-by-step solutions.</Text>
                    </Box>
                    <Button
                      colorScheme="green"
                      onClick={handleGenerateMathQuestions}
                      isLoading={isLoading && questionType === 'math'}
                      loadingText="Generating"
                      width="full"
                      size="lg"
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Generate Math Questions
                    </Button>
                  </TabPanel>
                  <TabPanel>
                    <Box bg="orange.50" p={4} borderRadius="md" mb={4}>
                      <Text>Generate a diverse mix of technical questions across various domains.</Text>
                    </Box>
                    <Button
                      colorScheme="orange"
                      onClick={handleGenerateDiverseCodeQuestions}
                      isLoading={isLoading && questionType === 'diverse'}
                      loadingText="Generating"
                      width="full"
                      size="lg"
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Generate Diverse Questions
                    </Button>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              {questions.length > 0 && (
                <>
                  <HStack spacing={2} overflowX="auto" py={4}>
                    {questions.map((_, index) => (
                      <Button
                        key={index}
                        size="sm"
                        colorScheme={currentQuestionIndex === index ? "blue" : "gray"}
                        onClick={() => handleQuestionSelect(index)}
                        boxShadow="sm"
                      >
                        Q{index + 1}
                      </Button>
                    ))}
                  </HStack>

                  <Flex direction={{ base: "column", lg: "row" }} gap={6} height="600px">
                    <Box flex="1">
                      <FormControl height="100%">
                        <FormLabel fontWeight="medium">Questions Editor</FormLabel>
                        <Box height="calc(100% - 25px)" borderRadius="md" overflow="hidden" boxShadow="md">
                          <Editor
                            height="100%"
                            defaultLanguage="markdown"
                            value={questionsText}
                            onChange={handleQuestionTextChange}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              wordWrap: 'on',
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true
                            }}
                          />
                        </Box>
                      </FormControl>
                    </Box>

                    <Box flex="1">
                      <FormControl height="100%">
                        <FormLabel fontWeight="medium">Solution Editor</FormLabel>
                        <Box height="calc(100% - 25px)" borderRadius="md" overflow="hidden" boxShadow="md">
                          <Editor
                            height="100%"
                            defaultLanguage={questionType === 'math' ? 'plaintext' : 'python'}
                            value={currentSolution}
                            onChange={handleSolutionChange}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 14,
                              wordWrap: 'on',
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true
                            }}
                          />
                        </Box>
                      </FormControl>
                    </Box>
                  </Flex>

                  <ButtonGroup width="full" spacing={4}>
                    <Button
                      colorScheme="green"
                      onClick={handleSave}
                      isLoading={isLoading}
                      loadingText="Saving"
                      flex="1"
                      size="lg"
                      leftIcon={<Icon as={FaSave} />}
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Save Exam
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handleDownload}
                      isLoading={isLoading}
                      loadingText="Downloading"
                      flex="1"
                      size="lg"
                      leftIcon={<Icon as={FaDownload} />}
                      boxShadow="md"
                      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Download Exam
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default CreateCodingExam;