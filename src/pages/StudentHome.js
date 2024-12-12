import React from 'react';
import { Box, Heading, VStack, Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import StudentDashboard from '../components/student/StudentDashboard';

const StudentHome = () => {
  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Welcome, Student</Heading>
        <StudentDashboard />
        <Box>
          <Heading size="md" mb={4}>Available Actions</Heading>
          <VStack spacing={4} align="stretch">
            <Button as={Link} to="/student/take-exam" colorScheme="teal">
              Take an Exam
            </Button>
            <Button as={Link} to="/student/view-lectures" colorScheme="blue">
              View Lectures
            </Button>
            <Button as={Link} to="/student/view-results" colorScheme="green">
              View Exam Results
            </Button>
          </VStack>
        </Box>
        <Box>
          <Heading size="md" mb={4}>Recent Notifications</Heading>
          <VStack spacing={2} align="stretch" bg="gray.100" p={4} borderRadius="md">
            <Text>New exam scheduled for next week</Text>
            <Text>Your last exam results are now available</Text>
            <Text>New lecture materials have been uploaded</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default StudentHome;