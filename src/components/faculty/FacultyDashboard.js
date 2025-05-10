import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

const FacultyDashboard = () => {
  return (
    <Box>
      <Heading size="md" mb={4}>Faculty Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Exam Generation</StatLabel>
          <StatNumber>Standard & Advanced</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Lecture Management</StatLabel>
          <StatNumber>Compose Lectures</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Exam Formats</StatLabel>
          <StatNumber>All Subjects</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Exam Control</StatLabel>
          <StatNumber>Manage Exams</StatNumber>
          
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default FacultyDashboard;
