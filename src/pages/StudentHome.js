// src/pages/StudentHome.js
import React from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Container, 
  useColorModeValue,
  Text,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FaGraduationCap } from 'react-icons/fa';
import StudentDashboard from '../components/student/StudentDashboard';

const StudentHome = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)">
      <Box bg={headerBg} py={6} mb={8}>
        <Container maxW="container.xl">
          <Heading size="xl">Student Dashboard</Heading>
          <Text mt={2} fontSize="lg" color="gray.600">
            View available exams and track your academic progress
          </Text>
        </Container>
      </Box>
      
      <Container maxW="container.xl" py={4}>
        <VStack spacing={8} align="stretch">
          <Card 
            bg={cardBg}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            mb={6}
          >
            <CardHeader pb={0}>
              <Flex align="center">
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="blue.100"
                  color="blue.500"
                  mr={4}
                >
                  <Icon as={FaGraduationCap} w={6} h={6} />
                </Flex>
                <Heading size="md">My Learning Portal</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Text color="gray.600" mb={4}>
                View your available exams, track your progress, and access your results below.
              </Text>
              <Box mt={4}>
                <StudentDashboard />
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default StudentHome;