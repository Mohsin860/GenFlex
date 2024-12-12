import React from 'react';
import { Box, Heading, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import FacultyDashboard from '../components/faculty/FacultyDashboard';

const FacultyHome = () => {
  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Welcome, Faculty</Heading>
        <FacultyDashboard />
        <VStack spacing={4} align="stretch">
          <Button as={Link} to="/faculty/create-exam" colorScheme="teal">
            Descriptive Exam
          </Button>
          <Button as={Link} to="/faculty/evaluate-exam" colorScheme="teal">
            Evaluate Exam
          </Button>
          <Button as={Link} to="/faculty/create-coding-exam" colorScheme="teal">
            Create Exam (Coding and Mathematical)
          </Button>
          <Button as={Link} to="/faculty/create-lecture" colorScheme="teal">
            Create Lecture
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
};

export default FacultyHome;