// src/pages/FacultyHome.js
import React from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Button, 
  Divider, 
  Text, 
  Container,
  SimpleGrid,
  Flex,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import FacultyDashboard from '../components/faculty/FacultyDashboard';
import { 
  FaFileAlt, 
  FaCode, 
  FaBook, 
  FaTasks
} from 'react-icons/fa';

const ActionCard = ({ title, description, icon, to, colorScheme = "teal" }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Card 
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
        borderColor: `${colorScheme}.300`
      }}
      height="100%"
    >
      <CardHeader pb={0}>
        <Flex spacing={4} align="center">
          <Flex
            w={12}
            h={12}
            align="center"
            justify="center"
            borderRadius="full"
            bg={`${colorScheme}.100`}
            color={`${colorScheme}.500`}
            mr={4}
          >
            <Icon as={icon} w={6} h={6} />
          </Flex>
          <Heading size="md">{title}</Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Text color="gray.600" mb={4}>
          {description}
        </Text>
        <Button 
          as={Link} 
          to={to} 
          colorScheme={colorScheme}
          size="md"
          width="full"
          mt="auto"
        >
          Get Started
        </Button>
      </CardBody>
    </Card>
  );
};

const FacultyHome = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('teal.50', 'teal.900');
  
  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)">
      <Box bg={headerBg} py={6} mb={8}>
        <Container maxW="container.xl">
          <Heading size="xl">Welcome to Faculty Dashboard</Heading>
          <Text mt={2} fontSize="lg" color="gray.600">
            Create and manage exams, lectures, and student evaluations
          </Text>
        </Container>
      </Box>
      
      <Container maxW="container.xl" py={4}>
        <VStack spacing={8} align="stretch">
          <FacultyDashboard />
          
          <Box>
            <Heading size="lg" mb={6}>Create Content</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              <ActionCard
                title="Essay-Based Exam"
                description="Create exams with essay-type questions, automatically generated from your lecture materials."
                icon={FaFileAlt}
                to="/faculty/create-exam"
                colorScheme="teal"
              />
              
              <ActionCard
                title="Technical Exam"
                description="Generate coding challenges, math problems, and technical assessments for your students."
                icon={FaCode}
                to="/faculty/create-coding-exam"
                colorScheme="blue"
              />
              
              <ActionCard
                title="Lecture Material"
                description="Upload and create lecture materials with AI-powered summaries for your students."
                icon={FaBook}
                to="/faculty/create-lecture"
                colorScheme="purple"
              />
            </SimpleGrid>
          </Box>
          
          <Divider my={6} />
          
          <Box>
            <Heading size="lg" mb={6}>Management & Evaluation</Heading>
            <Card 
              width="100%"
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-5px)',
                boxShadow: 'lg',
                borderColor: "green.300"
              }}
            >
              <CardBody>
                <Flex align="center">
                  <Flex
                    w={12}
                    h={12}
                    align="center"
                    justify="center"
                    borderRadius="full"
                    bg="green.100"
                    color="green.500"
                    mr={4}
                  >
                    <Icon as={FaTasks} w={6} h={6} />
                  </Flex>
                  <Box>
                    <Heading size="md" mb={2}>Exam Management</Heading>
                    <Text color="gray.600" mb={4}>
                      Publish exams, review student submissions, and provide feedback on completed assessments.
                    </Text>
                  </Box>
                  <Button 
                    as={Link} 
                    to="/manage-exams" 
                    colorScheme="green"
                    size="md"
                    ml="auto"
                  >
                    Manage Exams
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default FacultyHome;