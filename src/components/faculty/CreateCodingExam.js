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
  NumberDecrementStepper
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import axios from 'axios';


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
  const toast = useToast();

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
      const response = await axios.post('http://localhost:5000/api/coding-exams/generate', {
        prompt,
        difficulty: 'medium',
        title: examTitle,
        numQuestions: parseInt(numQuestions)
      });

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
      const response = await axios.post('http://localhost:5000/api/coding-exams/generate-diverse', {
        prompt,
        title: examTitle,
        numQuestions: parseInt(numQuestions)
      });
  
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
      const response = await axios.post('http://localhost:5000/api/coding-exams/generate-math', {
        prompt,
        title: examTitle,
        numQuestions: parseInt(numQuestions)
      });

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
      const response = await axios.post('http://localhost:5000/api/coding-exams/generate-complex', {
        prompt,
        title: examTitle,
        numQuestions: parseInt(numQuestions)
      });

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
      const response = await axios.post('http://localhost:5000/api/coding-exams/save', {
        examId: currentExamId,
        title: examTitle,
        questions: questions,
        editedContent: questionsText
      });

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

      const response = await axios.post(
        'http://localhost:5000/api/coding-exams/download',
        {
          examId: currentExamId,
          title: examTitle,
          questions: questions
        },
        { responseType: 'blob' }
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
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Container maxW="container.xl" flex="1" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Create Coding , Math Exam</Heading>

          <Flex gap={4} direction={{ base: "column", md: "row" }}>
            <FormControl flex="2">
              <FormLabel>Exam Title</FormLabel>
              <Input
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Enter exam title"
              />
            </FormControl>
            
            <FormControl flex="2">
              <FormLabel>Prompt</FormLabel>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt (e.g., 'binary search, graph algorithms')"
              />
            </FormControl>

            <FormControl flex="1">
              <FormLabel>Number of Questions</FormLabel>
              <NumberInput
                value={numQuestions}
                onChange={(valueString) => setNumQuestions(valueString)}
                min={1}
                max={15}
                defaultValue={5}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <VStack flex="1" spacing={2} justifyContent="flex-end">
              <Button
                colorScheme="blue"
                onClick={handleGenerateMediumQuestions}
                isLoading={isLoading && questionType === 'medium'}
                width="full"
              >
                
                Generate Mid Code
              </Button>
              <Button
                colorScheme="purple"
                onClick={handleGenerateComplexQuestions}
                isLoading={isLoading && questionType === 'complex'}
                width="full"
              >
                Generate Complex Code
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleGenerateMathQuestions}
                isLoading={isLoading && questionType === 'math'}
                width="full"
              >
                Generate Math Questions
              </Button>

              <Button
              colorScheme="orange"
              onClick={handleGenerateDiverseCodeQuestions}
              isLoading={isLoading && questionType === 'diverse'}
              width="full"
              >
                Generate Diverse Code
              </Button>
              
            </VStack>
          </Flex>

          {questions.length > 0 && (
            <>
              <HStack spacing={2} overflowX="auto" py={2}>
                {questions.map((_, index) => (
                  <Button
                    key={index}
                    size="sm"
                    colorScheme={currentQuestionIndex === index ? "blue" : "gray"}
                    onClick={() => handleQuestionSelect(index)}
                  >
                    Q{index + 1}
                  </Button>
                ))}
              </HStack>

              <Flex direction={{ base: "column", lg: "row" }} gap={6} height="600px">
                <Box flex="1">
                  <FormControl height="100%">
                    <FormLabel>Questions Editor</FormLabel>
                    <Box height="calc(100% - 25px)" borderRadius="md" overflow="hidden">
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
                    <FormLabel>Solution Editor</FormLabel>
                    <Box height="calc(100% - 25px)" borderRadius="md" overflow="hidden">
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
                  flex="1"
                >
                  Save Exam
                </Button>
                <Button
                  colorScheme="teal"
                  onClick={handleDownload}
                  isLoading={isLoading}
                  flex="1"
                >
                  Download Exam
                </Button>
              </ButtonGroup>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateCodingExam;