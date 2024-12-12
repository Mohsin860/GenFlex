import React from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

const FacultyDashboard = () => {
  return (
    <Box>
      <Heading size="md" mb={4}>Dashboard</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Question Generation</StatLabel>
          <StatNumber>Medium & Complex</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Lecture Creation</StatLabel>
          <StatNumber>PDF to Lectures</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Question Types</StatLabel>
          <StatNumber>Descriptive , Coding & Mathematical</StatNumber>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default FacultyDashboard;