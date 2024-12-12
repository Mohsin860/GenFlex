import React, { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, VStack, Heading, Textarea, useToast,
  Table, Thead, Tbody, Tr, Th, Td, Switch, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';

const EvaluateExam = () => {
  const [examId, setExamId] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [isEvaluationReviewed, setIsEvaluationReviewed] = useState(false);
  const [showMarksToStudents, setShowMarksToStudents] = useState(false);
  const toast = useToast();

  const handleFetchAndEvaluateExam = async () => {
    // In a real application, this would be an API call
    try {
      // Simulating API call
      const response = await new Promise(resolve => setTimeout(() => resolve({
        data: [
          { id: 1, studentId: '001', question: 'What is React?', answer: 'React is a JavaScript library for building user interfaces.', score: 0, maxScore: 10, feedback: '' },
          { id: 2, studentId: '001', question: 'Explain useState hook.', answer: 'useState is a hook that lets you add state to functional components.', score: 0, maxScore: 10, feedback: '' },
          { id: 3, studentId: '002', question: 'What is React?', answer: 'React is a front-end framework.', score: 0, maxScore: 10, feedback: '' },
          { id: 4, studentId: '002', question: 'Explain useState hook.', answer: 'useState is used to manage state in React components.', score: 0, maxScore: 10, feedback: '' },
        ]
      }), 1000));

      setEvaluations(response.data);
      toast({
        title: "Exam Fetched",
        description: "The exam has been fetched and is ready for evaluation.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch exam. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleScoreChange = (id, newScore) => {
    setEvaluations(evaluations.map(evaluation => 
      evaluation.id === id ? {...evaluation, score: newScore} : evaluation
    ));
  };

  const handleFeedbackChange = (id, newFeedback) => {
    setEvaluations(evaluations.map(evaluation => 
      evaluation.id === id ? {...evaluation, feedback: newFeedback} : evaluation
    ));
  };

  const handleReviewComplete = async () => {
    // In a real application, this would be an API call to save the evaluations
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEvaluationReviewed(true);
      toast({
        title: "Review Completed",
        description: "The evaluations have been saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save evaluations. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleShowMarks = async () => {
    // In a real application, this would be an API call to update the visibility of marks
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowMarksToStudents(!showMarksToStudents);
      toast({
        title: showMarksToStudents ? "Marks Hidden" : "Marks Visible",
        description: showMarksToStudents ? "Students can no longer see their marks." : "Students can now see their marks.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mark visibility. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="800px" margin="auto" mt={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Evaluate Exam</Heading>
        <FormControl>
          <FormLabel>Exam ID</FormLabel>
          <Input value={examId} onChange={(e) => setExamId(e.target.value)} />
        </FormControl>
        <Button onClick={handleFetchAndEvaluateExam} colorScheme="teal" isDisabled={evaluations.length > 0}>
          Fetch Exam
        </Button>
        {evaluations.length > 0 && (
          <>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student ID</Th>
                  <Th>Question</Th>
                  <Th>Answer</Th>
                  <Th>Score</Th>
                  <Th>Feedback</Th>
                </Tr>
              </Thead>
              <Tbody>
                {evaluations.map((evaluation) => (
                  <Tr key={evaluation.id}>
                    <Td>{evaluation.studentId}</Td>
                    <Td>{evaluation.question}</Td>
                    <Td>{evaluation.answer}</Td>
                    <Td>
                      <NumberInput 
                        value={evaluation.score} 
                        min={0} 
                        max={evaluation.maxScore}
                        onChange={(valueString) => handleScoreChange(evaluation.id, parseInt(valueString))}
                        isReadOnly={isEvaluationReviewed}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                    <Td>
                      <Textarea 
                        value={evaluation.feedback} 
                        onChange={(e) => handleFeedbackChange(evaluation.id, e.target.value)}
                        isReadOnly={isEvaluationReviewed}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Button onClick={handleReviewComplete} colorScheme="teal" isDisabled={isEvaluationReviewed}>
              Exam Show Up
            </Button>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="show-marks" mb="0">
                Show Marks to Students
              </FormLabel>
              <Switch 
                id="show-marks" 
                isChecked={showMarksToStudents} 
                onChange={handleToggleShowMarks}
                isDisabled={!isEvaluationReviewed}
              />
            </FormControl>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default EvaluateExam;