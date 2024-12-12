// CreateExam.js
import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Textarea, Select, useToast,
  Grid, GridItem, HStack, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
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
  const toast = useToast();

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

      const response = await axios.post('http://localhost:5000/api/exams/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate exam",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateExamSolution = async () => {
    if (!examContent) {
      toast({
        title: "No Questions",
        description: "Please generate exam questions first.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/exams/generate-solution', {
        examId,
        questions: questions
      });

      if (response.data.success) {
        setExamSolution(response.data.solution);
        toast({
          title: "Solution Generated",
          description: "Exam solution has been generated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate solution",
        status: "error",
        duration: 3000,
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

      const response = await axios.post('http://localhost:5000/api/exams/update-and-download', {
        examId,
        title: examTitle,
        questions: editedQuestions,
        content: examContent,
        type: examType
      }, { responseType: 'blob' });

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
      toast({
        title: "Error",
        description: "Failed to update and download exam",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="1200px" margin="auto" mt={8}>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem colSpan={2}>
          <Heading>Create New Exam</Heading>
        </GridItem>
        <GridItem colSpan={1}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Exam Title</FormLabel>
              <Input 
                value={examTitle} 
                onChange={(e) => setExamTitle(e.target.value)} 
                placeholder="Enter exam title"
                isReadOnly={isExamFinalized}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Exam Type</FormLabel>
              <Select 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)}
                isDisabled={isExamFinalized}
              >
                <option value="essay">Essay</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Number of Questions</FormLabel>
              <NumberInput 
                min={1} 
                max={20} 
                value={numQuestions}
                onChange={(valueString) => setNumQuestions(parseInt(valueString))}
                isDisabled={isExamFinalized}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Add Question Manually (Optional)</FormLabel>
              <Textarea 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="Enter your question here"
                isReadOnly={isExamFinalized}
              />
              <Button 
                mt={2} 
                onClick={handleAddQuestion} 
                isDisabled={isExamFinalized || !question.trim()}
              >
                Add Question
              </Button>
            </FormControl>
            <FormControl>
              <FormLabel>Upload PDF</FormLabel>
              <Input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                isDisabled={isExamFinalized}
              />
            </FormControl>
            <HStack spacing={4} width="full">
              <Button 
                onClick={handleGenerateExam} 
                colorScheme="blue" 
                flex={1}
                isDisabled={isExamFinalized || isLoading || !pdfFile}
                isLoading={isLoading}
              >
                Generate Questions
              </Button>
              <Button 
                onClick={handleGenerateExamSolution} 
                colorScheme="green" 
                flex={1}
                isDisabled={!examContent || isLoading}
              >
                Generate Solution
              </Button>
            </HStack>
            <Button 
              onClick={handleUpdateAndDownload}
              leftIcon={<DownloadIcon />}
              colorScheme="teal"
              width="full"
              isDisabled={!examContent || isLoading}
              isLoading={isLoading}
            >
              Download Exam
            </Button>
          </VStack>
        </GridItem>
        <GridItem colSpan={1}>
          <VStack spacing={4}>
            <FormControl flex="1">
              <FormLabel>Generated Questions (Editable)</FormLabel>
              <Textarea
                value={examContent}
                onChange={(e) => setExamContent(e.target.value)}
                height="200px"
                isReadOnly={isExamFinalized}
                placeholder="Generated questions will appear here..."
              />
            </FormControl>
            <FormControl flex="1">
              <FormLabel>Generated Solution (Editable)</FormLabel>
              <Textarea
                value={examSolution}
                onChange={(e) => setExamSolution(e.target.value)}
                height="200px"
                isReadOnly={isExamFinalized}
                placeholder="Generated solution will appear here..."
              />
            </FormControl>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default CreateExam;