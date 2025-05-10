import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Text,
  Container,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  HStack,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getAvailableExams, getStudentAttempts } from '../../services/studentExamService';
import { FaEdit, FaEye, FaGraduationCap, FaClipboardCheck, FaPercentage } from 'react-icons/fa';

const StudentDashboard = () => {
  const [availableExams, setAvailableExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const statBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const tableHeadBg = useColorModeValue('gray.50', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const tabSelected = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // First try to get exams
        try {
          const examsData = await getAvailableExams();
          setAvailableExams(examsData.exams || []);
        } catch (examsError) {
          console.error('Error fetching exams:', examsError);
          // Don't set toast yet, try to get attempts first
        }

        // Then try to get attempts
        try {
          const attemptsData = await getStudentAttempts();
          setAttempts(attemptsData.attempts || []);
        } catch (attemptsError) {
          console.error('Error fetching attempts:', attemptsError);
          // Don't set toast yet
        }

      } catch (error) {
        console.error('General error in fetchData:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please check your connection and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const takeExam = (examId, examType) => {
    navigate(`/take-exam/${examType}/${examId}`);
  };

  const viewResults = (attemptId) => {
    navigate(`/exam-results/${attemptId}`);
  };

  // Calculate stats
  const examsTaken = attempts.length;
  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum, att) => sum + att.totalScore, 0) / attempts.length)
    : 0;
  const bestScore = attempts.length
    ? Math.max(...attempts.map(att => att.totalScore))
    : 0;

  // Helper to get exam type badge
  const getExamTypeBadge = (type) => {
    let color;
    switch (type.toLowerCase()) {
      case 'essay':
        color = 'blue';
        break;
      case 'coding':
        color = 'green';
        break;
      case 'math':
        color = 'purple';
        break;
      case 'complex':
        color = 'red';
        break;
      case 'diverse':
        color = 'orange';
        break;
      default:
        color = 'gray';
    }
    return (
      <Badge 
        colorScheme={color} 
        py={1} 
        px={2} 
        borderRadius="md"
        fontSize="sm"
      >
        {type}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 150px)" py={8} textAlign="center">
        <Container maxW="container.xl">
          <Flex direction="column" align="center" justify="center" py={10}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text mt={4} fontSize="lg" fontWeight="medium">Loading dashboard...</Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
      <Container maxW="container.xl">
        <Card bg={cardBg} boxShadow="md" mb={6}>
          <CardHeader bg={headerBg} py={4}>
            <Heading size="lg">Student Dashboard</Heading>
          </CardHeader>
          <CardBody>
            {/* Stats Section */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
              <Card bg={statBg} boxShadow="sm">
                <CardBody>
                  <Stat>
                    <Flex align="center" mb={2}>
                      <Icon as={FaGraduationCap} color="blue.500" boxSize={5} mr={2} />
                      <StatLabel fontSize="md" fontWeight="medium">Exams Taken</StatLabel>
                    </Flex>
                    <StatNumber fontSize="3xl">{examsTaken}</StatNumber>
                    <StatHelpText>Total completed exams</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg={statBg} boxShadow="sm">
                <CardBody>
                  <Stat>
                    <Flex align="center" mb={2}>
                      <Icon as={FaPercentage} color="green.500" boxSize={5} mr={2} />
                      <StatLabel fontSize="md" fontWeight="medium">Average Score</StatLabel>
                    </Flex>
                    <StatNumber fontSize="3xl" color={averageScore >= 70 ? "green.500" : "orange.500"}>
                      {averageScore}%
                    </StatNumber>
                    <StatHelpText>Across all exams</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg={statBg} boxShadow="sm">
                <CardBody>
                  <Stat>
                    <Flex align="center" mb={2}>
                      <Icon as={FaClipboardCheck} color="purple.500" boxSize={5} mr={2} />
                      <StatLabel fontSize="md" fontWeight="medium">Best Score</StatLabel>
                    </Flex>
                    <StatNumber fontSize="3xl" color="purple.500">{bestScore}%</StatNumber>
                    <StatHelpText>Your highest achievement</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Tabs for Exams & History */}
            <Tabs 
              variant="soft-rounded" 
              colorScheme="blue" 
              borderRadius="md"
              boxShadow="sm"
              p={4}
              bg={cardBg}
            >
              <TabList mb={4} overflowX="auto" py={2}>
                <Tab 
                  _selected={{ 
                    color: 'white', 
                    bg: tabSelected,
                    boxShadow: 'md'  
                  }}
                  _hover={{ bg: hoverBg }}
                  borderRadius="full"
                  mr={2}
                >
                  Available Exams
                </Tab>
                <Tab 
                  _selected={{ 
                    color: 'white', 
                    bg: tabSelected,
                    boxShadow: 'md'  
                  }}
                  _hover={{ bg: hoverBg }}
                  borderRadius="full"
                >
                  Exam History
                </Tab>
              </TabList>

              <TabPanels>
                {/* Available Exams Tab */}
                <TabPanel px={0}>
                  <Box overflowX="auto" boxShadow="sm" borderRadius="md">
                    <TableContainer>
                      <Table variant="simple">
                        <Thead bg={tableHeadBg}>
                          <Tr>
                            <Th>Title</Th>
                            <Th>Type</Th>
                            <Th>Questions</Th>
                            <Th>Created</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {availableExams.length > 0 ? (
                            availableExams.map((exam) => (
                              <Tr 
                                key={`${exam.examModel}-${exam._id}`}
                                _hover={{ bg: hoverBg }}
                                transition="background 0.2s"
                              >
                                <Td fontWeight="medium">{exam.title}</Td>
                                <Td>{getExamTypeBadge(exam.type)}</Td>
                                <Td>{exam.questionCount}</Td>
                                <Td>{formatDate(exam.createdAt)}</Td>
                                <Td>
                                  <Tooltip label="Begin this exam">
                                    <Button
                                      colorScheme="blue"
                                      size="sm"
                                      onClick={() => takeExam(exam._id, exam.examModel)}
                                      leftIcon={<Icon as={FaEdit} />}
                                      boxShadow="sm"
                                      _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                      transition="all 0.2s"
                                    >
                                      Take Exam
                                    </Button>
                                  </Tooltip>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={6}>
                                <Flex direction="column" align="center">
                                  <Icon as={FaGraduationCap} boxSize={8} color="gray.400" mb={2} />
                                  <Text fontSize="lg" fontWeight="medium" color="gray.500">No exams available</Text>
                                  <Text fontSize="sm" color="gray.400">Check back later for new assignments</Text>
                                </Flex>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </TabPanel>

                {/* Exam History Tab */}
                <TabPanel px={0}>
                  <Box overflowX="auto" boxShadow="sm" borderRadius="md">
                    <TableContainer>
                      <Table variant="simple">
                        <Thead bg={tableHeadBg}>
                          <Tr>
                            <Th>Exam</Th>
                            <Th>Score</Th>
                            <Th>Status</Th>
                            <Th>Submitted</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {attempts.length > 0 ? (
                            attempts.map((attempt) => (
                              <Tr 
                                key={attempt._id}
                                _hover={{ bg: hoverBg }}
                                transition="background 0.2s"
                              >
                                <Td fontWeight="medium">{attempt.examTitle}</Td>
                                <Td>
                                  {attempt.status === 'evaluated' && attempt.resultsPublished && attempt.totalScore !== null ? (
                                    <HStack>
                                      <Badge 
                                        colorScheme={attempt.totalScore >= 70 ? "green" : attempt.totalScore >= 50 ? "yellow" : "red"}
                                        py={1}
                                        px={2}
                                        borderRadius="md"
                                        fontSize="sm"
                                      >
                                        {attempt.totalScore}%
                                      </Badge>
                                    </HStack>
                                  ) : attempt.status === 'evaluated' && !attempt.resultsPublished ? (
                                    <Badge 
                                      colorScheme="yellow"
                                      py={1}
                                      px={2}
                                      borderRadius="md"
                                      fontSize="sm"
                                    >
                                      Results Pending
                                    </Badge>
                                  ) : (
                                    'Pending'
                                  )}
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      attempt.status === 'evaluated' && attempt.resultsPublished ? "green" :
                                        attempt.status === 'evaluated' ? "yellow" :
                                          attempt.status === 'reviewing' ? "orange" : "blue"
                                    }
                                    py={1}
                                    px={2}
                                    borderRadius="md"
                                    fontSize="sm"
                                  >
                                    {attempt.status === 'evaluated' && !attempt.resultsPublished
                                      ? "Evaluated (Unpublished)"
                                      : attempt.status}
                                  </Badge>
                                </Td>
                                <Td>{formatDate(attempt.submittedAt)}</Td>
                                <Td>
                                  <Button
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => viewResults(attempt._id)}
                                    leftIcon={<Icon as={FaEye} />}
                                    boxShadow="sm"
                                    _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                    transition="all 0.2s"
                                  >
                                    View Submission
                                  </Button>
                                </Td>
                              </Tr>
                            ))
                          ) : (
                            <Tr>
                              <Td colSpan={5} textAlign="center" py={6}>
                                <Flex direction="column" align="center">
                                  <Icon as={FaClipboardCheck} boxSize={8} color="gray.400" mb={2} />
                                  <Text fontSize="lg" fontWeight="medium" color="gray.500">No exam history found</Text>
                                  <Text fontSize="sm" color="gray.400">Complete an exam to see your results here</Text>
                                </Flex>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default StudentDashboard;