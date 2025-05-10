import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Badge,
  Alert,
  AlertIcon,
  Container,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Flex,
  Icon,
  ButtonGroup,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import { getExamForSolution, saveTeacherSolutions } from '../../services/teacherExamService';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { FaSave, FaCodeBranch, FaCheck, FaTimes } from 'react-icons/fa';

const TeacherSolutionEditor = () => {
  const { examType, examId } = useParams();
  const [exam, setExam] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accentBg = useColorModeValue('blue.50', 'blue.900');
  const questionBg = useColorModeValue('gray.50', 'gray.800');
  const tabSelected = useColorModeValue('teal.500', 'teal.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await getExamForSolution(examType, examId);
        setExam(response.exam);
        
        // Initialize solutions from existing teacherSolution fields or empty strings
        const initialSolutions = response.exam.questions.map(question => ({
          questionId: question._id,
          solution: question.teacherSolution || ''
        }));
        
        setSolutions(initialSolutions);
      } catch (error) {
        console.error('Error fetching exam:', error);
        setError('Failed to load the exam. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (examId && examType) {
      fetchExam();
    }
  }, [examId, examType]);

  const handleSolutionChange = (value, index) => {
    const updatedSolutions = [...solutions];
    updatedSolutions[index] = { 
      ...updatedSolutions[index], 
      solution: value 
    };
    setSolutions(updatedSolutions);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveTeacherSolutions(examId, examType, solutions);
      toast({
        title: 'Success',
        description: 'Solutions saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving solutions:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save solutions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const getDefaultLanguage = () => {
    if (!exam) return 'plaintext';
    
    if (examType === 'CodingExam') {
      const examTypeMap = {
        coding: 'javascript',
        diverse: 'python',
        complex: 'python',
        math: 'plaintext'
      };
      return examTypeMap[exam.type] || 'javascript';
    }
    
    return 'plaintext'; // Default for essay exams
  };

  const getExamTypeBadge = () => {
    if (!exam) return null;
    
    let color;
    const type = examType === 'Exam' ? 'essay' : (exam.type || 'coding').toLowerCase();
    
    switch (type) {
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
        fontSize="sm" 
        py={1} 
        px={2} 
        borderRadius="md"
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 150px)" py={8} textAlign="center">
        <Container maxW="container.xl">
          <Flex direction="column" align="center" justify="center" py={10}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text mt={4} fontSize="lg" fontWeight="medium">Loading exam solutions...</Text>
          </Flex>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
        <Container maxW="container.xl">
          <Card bg={cardBg} boxShadow="md">
            <CardBody>
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Text>{error}</Text>
              </Alert>
              <Button 
                mt={4} 
                onClick={() => navigate('/manage-exams')}
                leftIcon={<ChevronLeftIcon />}
                colorScheme="blue"
              >
                Back to Manage Exams
              </Button>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!exam) {
    return (
      <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
        <Container maxW="container.xl">
          <Card bg={cardBg} boxShadow="md">
            <CardBody>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Text>Exam not found</Text>
              </Alert>
              <Button 
                mt={4} 
                onClick={() => navigate('/manage-exams')}
                leftIcon={<ChevronLeftIcon />}
                colorScheme="blue"
              >
                Back to Manage Exams
              </Button>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
      <Container maxW="container.xl">
        <Card bg={cardBg} boxShadow="md" mb={6}>
          <CardHeader bg={accentBg} py={4}>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'flex-start', md: 'center' }}
            >
              <Box mb={{ base: 4, md: 0 }}>
                <Breadcrumb mb={2}>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate('/manage-exams')}>
                      Manage Exams
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink>Solution Editor</BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
                
                <Flex align="center" gap={3}>
                  <Heading size="lg">{exam.title}</Heading>
                  {getExamTypeBadge()}
                </Flex>
              </Box>
              
              <ButtonGroup>
                <Button
                  leftIcon={<ChevronLeftIcon />}
                  colorScheme="gray"
                  onClick={() => navigate('/manage-exams')}
                  size="sm"
                >
                  Back to Exams
                </Button>
              </ButtonGroup>
            </Flex>
          </CardHeader>
          
          <CardBody>
            <Alert status="info" mb={6} borderRadius="md">
              <AlertIcon />
              <Text>
                Create a solution for each question. These solutions will be used as reference when
                evaluating student submissions.
              </Text>
            </Alert>

            <Tabs 
              variant="soft-rounded" 
              colorScheme="teal" 
              mb={6}
              borderRadius="md"
              boxShadow="sm"
              p={4}
              bg={cardBg}
            >
              <TabList mb={4} overflowX="auto" py={2}>
                {exam.questions.map((question, index) => (
                  <Tab 
                    key={index}
                    _selected={{ 
                      color: 'white', 
                      bg: tabSelected,
                      boxShadow: 'md'  
                    }}
                    _hover={{ bg: hoverBg }}
                    borderRadius="full"
                    mr={2}
                  >
                    <Flex align="center" gap={2}>
                      <Icon as={FaCodeBranch} />
                      <Text>Question {index + 1}</Text>
                    </Flex>
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {exam.questions.map((question, index) => (
                  <TabPanel key={index} px={0}>
                    <VStack spacing={4} align="stretch">
                      <Card bg={questionBg} boxShadow="sm">
                        <CardHeader pb={2}>
                          <Heading size="sm">Question:</Heading>
                        </CardHeader>
                        <CardBody pt={0}>
                          <Text 
                            whiteSpace="pre-wrap" 
                            p={3} 
                            bg="white" 
                            borderRadius="md"
                            boxShadow="inner"
                          >
                            {question.question}
                          </Text>
                        </CardBody>
                      </Card>

                      <Card boxShadow="sm">
                        <CardHeader pb={2}>
                          <Heading size="sm">Your Solution:</Heading>
                        </CardHeader>
                        <CardBody pt={0}>
                          <Box height="400px" borderRadius="md" overflow="hidden" boxShadow="inner">
                            <Editor
                              height="100%"
                              defaultLanguage={getDefaultLanguage()}
                              value={solutions[index]?.solution || ''}
                              onChange={(value) => handleSolutionChange(value, index)}
                              theme="vs-dark"
                              options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true
                              }}
                            />
                          </Box>
                        </CardBody>
                      </Card>
                    </VStack>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>

            <Flex 
              justifyContent="flex-end" 
              gap={3} 
              borderTop="1px"
              borderColor="gray.200"
              pt={6}
            >
              <Tooltip label="Discard changes and return to exam list">
                <Button
                  colorScheme="gray"
                  onClick={() => navigate('/manage-exams')}
                  isDisabled={saving}
                  leftIcon={<Icon as={FaTimes} />}
                  size="md"
                  boxShadow="md"
                  _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                >
                  Cancel
                </Button>
              </Tooltip>
              
              <Tooltip label="Save all solution changes">
                <Button
                  colorScheme="teal"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving..."
                  leftIcon={<Icon as={FaSave} />}
                  size="md"
                  boxShadow="md"
                  _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                >
                  Save Solutions
                </Button>
              </Tooltip>
            </Flex>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default TeacherSolutionEditor;