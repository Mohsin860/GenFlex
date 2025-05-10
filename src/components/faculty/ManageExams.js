import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Button,
    Badge,
    Switch,
    FormControl,
    FormLabel,
    useToast,
    Spinner,
    Text,
    HStack,
    Flex,
    ButtonGroup,
    Container,
    Card,
    CardHeader,
    CardBody,
    useColorModeValue,
    Icon,
    InputGroup,
    Input,
    InputRightElement,
    Select,
    Stack,
    Tooltip
} from '@chakra-ui/react';
import { getTeacherExams, toggleExamPublish } from '../../services/teacherExamService';
import { FaSync, FaEdit, FaEye, FaClipboardCheck, FaDownload, FaClock } from 'react-icons/fa';
import { SearchIcon } from '@chakra-ui/icons';

const ManageExams = () => {
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const toast = useToast();
    const navigate = useNavigate();

    // Color mode values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.700');
    const accentBg = useColorModeValue('blue.50', 'blue.900');
    const headerColor = useColorModeValue('gray.600', 'gray.200');
    const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        fetchExams();
    }, []);

    useEffect(() => {
        filterExams();
    }, [searchTerm, filterType, exams]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await getTeacherExams();
            setExams(response.exams || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast({
                title: 'Error',
                description: 'Failed to load exams',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const filterExams = () => {
        let result = [...exams];
        
        // Apply search filter
        if (searchTerm) {
            result = result.filter(exam => 
                exam.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply type filter
        if (filterType !== 'all') {
            result = result.filter(exam => exam.type.toLowerCase() === filterType.toLowerCase());
        }
        
        setFilteredExams(result);
    };

    const handlePublishToggle = async (examId, examType, currentState) => {
        try {
            setUpdating(examId);
            const newState = !currentState;

            await toggleExamPublish(examId, examType, newState);

            // Update the local state
            setExams(exams.map(exam =>
                exam._id === examId
                    ? { ...exam, isPublished: newState, publishedAt: newState ? new Date() : null }
                    : exam
            ));

            toast({
                title: newState ? 'Exam Published' : 'Exam Unpublished',
                description: newState
                    ? 'Students can now view and attempt this exam'
                    : 'Students can no longer access this exam',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error toggling exam publish status:', error);
            toast({
                title: 'Action Failed',
                description: 'Could not update exam status',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setUpdating(null);
        }
    };

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
        return <Badge colorScheme={color}>{type}</Badge>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not published';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

// Fixed formatDuration function for ManageExams.js

const formatDuration = (minutes) => {
    // Make sure we're working with a number
    if (typeof minutes !== 'number') {
        minutes = parseInt(minutes);
    }
    
    // If it's NaN or undefined after parsing, use default 120 minutes
    if (isNaN(minutes) || minutes === null || minutes === undefined) {
        minutes = 120; // Default 2 hours
    }
    
    // Format nicely
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
    } else {
        return `${minutes} minutes`;
    }
};

    const goToSolutionEditor = (examId, examType) => {
        navigate(`/solution-editor/${examType}/${examId}`);
    };

    const viewExamSubmissions = (examId, examType) => {
        navigate(`/exam-submissions/${examType}/${examId}`);
    };

    if (loading) {
        return (
            <Box textAlign="center" py={10} bg={bgColor} minH="calc(100vh - 150px)">
                <Spinner size="xl" color="blue.500" thickness="4px" />
                <Text mt={4} fontSize="lg" fontWeight="medium">Loading exams...</Text>
            </Box>
        );
    }

    return (
        <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
            <Container maxW="container.xl">
                <Card bg={cardBg} boxShadow="md" mb={6}>
                    <CardHeader bg={accentBg} py={4}>
                        <Flex justify="space-between" align="center">
                            <Heading size="lg">Manage Exams</Heading>
                            <Button 
                                colorScheme="blue" 
                                onClick={fetchExams}
                                leftIcon={<Icon as={FaSync} />}
                                size="md"
                                boxShadow="sm"
                                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                transition="all 0.2s"
                            >
                                Refresh
                            </Button>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        {exams.length === 0 ? (
                            <Box textAlign="center" py={10}>
                                <Text fontSize="lg" color={headerColor}>No exams found</Text>
                                <Text mt={2} fontSize="md" color="gray.500">Create an exam to get started</Text>
                            </Box>
                        ) : (
                            <>
                                <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
                                    <Box flex="1">
                                        <InputGroup>
                                            <Input
                                                placeholder="Search exams..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                boxShadow="sm"
                                                borderRadius="md"
                                            />
                                            <InputRightElement>
                                                <SearchIcon color="gray.500" />
                                            </InputRightElement>
                                        </InputGroup>
                                    </Box>
                                    <Box width={{ base: "100%", md: "250px" }}>
                                        <Select 
                                            value={filterType} 
                                            onChange={(e) => setFilterType(e.target.value)}
                                            boxShadow="sm"
                                            borderRadius="md"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="essay">Essay</option>
                                            <option value="coding">Coding</option>
                                            <option value="math">Math</option>
                                            <option value="complex">Complex</option>
                                            <option value="diverse">Diverse</option>
                                        </Select>
                                    </Box>
                                </Stack>

                                <Box overflowX="auto" boxShadow="sm" borderRadius="md">
                                    <TableContainer>
                                        <Table variant="simple">
                                            <Thead bg={tableHeaderBg}>
                                                <Tr>
                                                    <Th>Title</Th>
                                                    <Th>Type</Th>
                                                    <Th>Questions</Th>
                                                    <Th>Duration</Th>
                                                    <Th>Publication Status</Th>
                                                    <Th>Controls</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredExams.length > 0 ? (
                                                    filteredExams.map((exam) => (
                                                        <Tr 
                                                            key={`${exam.examModel}-${exam._id}`}
                                                            _hover={{ bg: hoverBg }}
                                                            transition="background 0.2s"
                                                        >
                                                            <Td fontWeight="medium">{exam.title}</Td>
                                                            <Td>{getExamTypeBadge(exam.type)}</Td>
                                                            <Td>{exam.questionCount}</Td>
                                                            <Td>
                                                                <Flex align="center">
                                                                    <Icon as={FaClock} color="blue.500" mr={1} />
                                                                    {formatDuration(exam.duration)}
                                                                </Flex>
                                                            </Td>
                                                            <Td>
                                                                {exam.isPublished ? (
                                                                    <Badge colorScheme="green" p={1} borderRadius="md">
                                                                        Published on {formatDate(exam.publishedAt)}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge colorScheme="red" p={1} borderRadius="md">Not published</Badge>
                                                                )}
                                                            </Td>
                                                            <Td>
                                                                <Flex wrap="wrap" gap={2} justify="space-between" align="center">
                                                                    <ButtonGroup size="sm" variant="solid" spacing={2} mr={2}>
                                                                        <Button
                                                                            colorScheme="blue"
                                                                            onClick={() => goToSolutionEditor(exam._id, exam.examModel)}
                                                                            leftIcon={<Icon as={FaEdit} />}
                                                                            boxShadow="sm"
                                                                            _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                                                            transition="all 0.2s"
                                                                        >
                                                                            Solution
                                                                        </Button>
                                                                        <Button
                                                                            colorScheme="purple"
                                                                            onClick={() => viewExamSubmissions(exam._id, exam.examModel)}
                                                                            leftIcon={<Icon as={FaEye} />}
                                                                            boxShadow="sm"
                                                                            _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                                                            transition="all 0.2s"
                                                                        >
                                                                            Submissions
                                                                        </Button>
                                                                    </ButtonGroup>
                                                                    <FormControl display="flex" alignItems="center" minW="120px">
                                                                        <FormLabel htmlFor={`publish-switch-${exam._id}`} mb="0" fontSize="sm">
                                                                            {updating === exam._id ? (
                                                                                <Spinner size="sm" />
                                                                            ) : (
                                                                                exam.isPublished ? (
                                                                                    <Text color="green.500" fontWeight="medium">Published</Text>
                                                                                ) : (
                                                                                    <Text color="red.500" fontWeight="medium">Draft</Text>
                                                                                )
                                                                            )}
                                                                        </FormLabel>
                                                                        <Switch
                                                                            id={`publish-switch-${exam._id}`}
                                                                            isChecked={exam.isPublished}
                                                                            onChange={() => handlePublishToggle(
                                                                                exam._id,
                                                                                exam.examModel,
                                                                                exam.isPublished
                                                                            )}
                                                                            isDisabled={updating === exam._id}
                                                                            colorScheme="green"
                                                                            size="md"
                                                                        />
                                                                    </FormControl>
                                                                </Flex>
                                                            </Td>
                                                        </Tr>
                                                    ))
                                                ) : (
                                                    <Tr>
                                                        <Td colSpan={6} textAlign="center" py={6}>
                                                            <Text>No exams match your search criteria</Text>
                                                        </Td>
                                                    </Tr>
                                                )}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                                
                                <Text mt={4} fontSize="sm" color="gray.500">
                                    Showing {filteredExams.length} of {exams.length} exams
                                </Text>
                            </>
                        )}
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

export default ManageExams;