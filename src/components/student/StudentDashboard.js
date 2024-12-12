import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';


const StudentDashboard = () => {
  return (
    <Box>
      <Heading size="md" mb={4}>Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <Stat>
          <StatLabel>Exams Taken</StatLabel>
          <StatNumber>3</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Average Score</StatLabel>
          <StatNumber>85%</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Lectures Viewed</StatLabel>
          <StatNumber>8</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default StudentDashboard;