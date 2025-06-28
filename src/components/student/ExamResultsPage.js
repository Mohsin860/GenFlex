import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    submitQuery,
    getQueries
} from '../../services/studentExamService';
import { 
    FaQuestionCircle, 
    FaReply, 
    FaCheck 
} from 'react-icons/fa';
import {
    Box,
    Heading,
    VStack,
    Card,
    CardBody,
    CardHeader,
    Stack,
    StackDivider,
    Text,
    Spinner,
    Button,
    Badge,
    HStack,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Progress,
    Container,
    Flex,
    Icon,
    SimpleGrid,
    useColorModeValue,
    Tooltip,
    Textarea,
    useToast
} from '@chakra-ui/react';
import { getExamResults } from '../../services/studentExamService';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { FaCheckCircle, FaClock, FaClipboardCheck, FaCommentAlt, FaExclamationTriangle } from 'react-icons/fa';

const ExamResultsPage = () => {
    const { attemptId } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [queries, setQueries] = useState([]);
    const [newQuery, setNewQuery] = useState('');
    const [currentQuestionId, setCurrentQuestionId] = useState('');
    const [showQueryForm, setShowQueryForm] = useState(false);
    const [submittingQuery, setSubmittingQuery] = useState(false);
    const toast = useToast();

    // Color mode values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.700');
    const headerBg = useColorModeValue('blue.50', 'blue.900');
    const statBg = useColorModeValue('gray.50', 'gray.800');
    const answerBg = useColorModeValue('gray.50', 'gray.800');
    const feedbackBg = useColorModeValue('blue.50', 'blue.900');
    const feedbackTextBg = useColorModeValue('white', 'gray.700');
    const feedbackTextColor = useColorModeValue('gray.700', 'gray.200');

    // Check if exam has been evaluated yet
    const isEvaluated = results && results.status === 'evaluated' && results.totalScore !== undefined;
    // Check if exam time expired
    const isExpired = results && results.status === 'expired';

    const fetchQueries = async () => {
        try {
            const response = await getQueries(attemptId);
            setQueries(response.queries);
        } catch (error) {
            console.error('Error fetching queries:', error);
            toast({
                title: 'Error',
                description: 'Failed to load queries',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleSubmitQuery = async () => {
        try {
            setSubmittingQuery(true);
            await submitQuery({
                attemptId,
                questionId: currentQuestionId,
                message: newQuery
            });
            
            toast({
                title: 'Query Submitted',
                description: 'Your query has been sent to the teacher',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            
            setNewQuery('');
            setShowQueryForm(false);
            fetchQueries();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to submit query',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSubmittingQuery(false);
        }
    };

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const response = await getExamResults(attemptId);
                setResults(response);
            } catch (error) {
                console.error('Error fetching results:', error);
                setError('Failed to load exam results. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (attemptId) {
            fetchResults();
        }
    }, [attemptId]);

    useEffect(() => {
        if (attemptId && isEvaluated) {
            fetchQueries();
        }
    }, [attemptId, isEvaluated]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        let color, icon;
        
        switch (status) {
            case 'evaluated':
                color = 'green';
                icon = FaCheckCircle;
                break;
            case 'reviewing':
                color = 'orange';
                icon = FaClock;
                break;
            case 'expired':
                color = 'red';
                icon = FaExclamationTriangle;
                break;
            default:
                color = 'blue';
                icon = FaClipboardCheck;
        }
        
        return (
            <Badge 
                colorScheme={color} 
                py={1} 
                px={3} 
                borderRadius="md"
                fontSize="sm"
                display="flex"
                alignItems="center"
            >
                <Icon as={icon} mr={1} boxSize={3} />
                {status === 'expired' ? 'Time Expired' : status}
            </Badge>
        );
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'green';
        if (score >= 60) return 'blue';
        if (score >= 40) return 'yellow';
        return 'red';
    };

    const getLetterGrade = (score) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    if (loading) {
        return (
            <Box bg={bgColor} minH="calc(100vh - 150px)" py={8} textAlign="center">
                <Container maxW="container.xl">
                    <Flex direction="column" align="center" justify="center" py={10}>
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text mt={4} fontSize="lg" fontWeight="medium">Loading results...</Text>
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
                                <AlertTitle mr={2}>Error!</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <Button 
                                mt={4} 
                                onClick={() => navigate('/student-dashboard')}
                                leftIcon={<ChevronLeftIcon />}
                                colorScheme="blue"
                            >
                                Back to Dashboard
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
                    <CardHeader bg={headerBg} py={4}>
                        <Flex 
                            direction={{ base: 'column', md: 'row' }} 
                            justify="space-between" 
                            align={{ base: 'flex-start', md: 'center' }}
                        >
                            <Box mb={{ base: 4, md: 0 }}>
                                <Breadcrumb mb={2}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={() => navigate('/student-dashboard')}>
                                            Dashboard
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem isCurrentPage>
                                        <BreadcrumbLink>Exam Results</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </Breadcrumb>
                                <Heading size="lg">{results ? results.examTitle : 'Exam Results'}</Heading>
                            </Box>
                            
                            <Button
                                leftIcon={<ChevronLeftIcon />}
                                colorScheme="blue"
                                onClick={() => navigate('/student-dashboard')}
                                size="sm"
                                boxShadow="sm"
                                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                transition="all 0.2s"
                            >
                                Back to Dashboard
                            </Button>
                        </Flex>
                    </CardHeader>
                    
                    <CardBody p={6}>
                        <Card bg={statBg} boxShadow="sm" mb={6}>
                            <CardBody>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium" mb={2}>Status</StatLabel>
                                        <StatNumber>
                                            {results && results.status ? getStatusBadge(results.status) : 
                                             <Badge colorScheme="blue" py={1} px={3} borderRadius="md" fontSize="sm">
                                                <Icon as={FaClipboardCheck} mr={1} boxSize={3} />
                                                Submitted
                                             </Badge>}
                                        </StatNumber>
                                        <StatHelpText>
                                            Submitted: {results ? formatDate(results.submittedAt) : 'N/A'}
                                            {results && results.expiresAt && (
                                                <Text mt={1}>
                                                    Time Limit: {formatDate(results.expiresAt)}
                                                </Text>
                                            )}
                                        </StatHelpText>
                                    </Stat>
                                    
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium" mb={2}>Score</StatLabel>
                                        <StatNumber>
                                            {isEvaluated ? (
                                                <HStack>
                                                    <Text color={`${getScoreColor(results.totalScore)}.500`} fontWeight="bold">
                                                        {results.totalScore}%
                                                    </Text> 
                                                    <Badge 
                                                        colorScheme={getScoreColor(results.totalScore)}
                                                        py={1} 
                                                        px={3} 
                                                        borderRadius="md"
                                                        fontSize="lg"
                                                    >
                                                        {getLetterGrade(results.totalScore)}
                                                    </Badge>
                                                </HStack>
                                            ) : results.message ? (
                                                <Badge 
                                                    colorScheme="yellow"
                                                    py={1} 
                                                    px={3} 
                                                    borderRadius="md"
                                                    fontSize="sm"
                                                >
                                                    <Icon as={FaClock} mr={1} boxSize={3} />
                                                    Results Pending
                                                </Badge>
                                            ) : 'Awaiting Evaluation'}
                                        </StatNumber>
                                        <StatHelpText>
                                            {isEvaluated && results.evaluatedAt ? 
                                                `Evaluated: ${formatDate(results.evaluatedAt)}` : 
                                                results.message || 'Evaluation in progress'
                                            }
                                        </StatHelpText>
                                    </Stat>
                                </SimpleGrid>
                                
                                {isExpired && (
                                    <Alert status="warning" mt={4} borderRadius="md">
                                        <AlertIcon />
                                        <Box>
                                            <AlertTitle>Time Limit Expired</AlertTitle>
                                            <AlertDescription>
                                                This exam was submitted after the time limit expired. 
                                                Your answers were automatically submitted when the time ran out.
                                            </AlertDescription>
                                        </Box>
                                    </Alert>
                                )}
                                
                                {isEvaluated && (
                                    <Box mt={6}>
                                        <Text fontSize="sm" mb={1} fontWeight="medium">Overall Performance</Text>
                                        <Tooltip label={`${results.totalScore}%`}>
                                            <Progress 
                                                value={results.totalScore} 
                                                colorScheme={getScoreColor(results.totalScore)}
                                                borderRadius="md"
                                                size="md"
                                                height="12px"
                                                boxShadow="sm"
                                            />
                                        </Tooltip>
                                    </Box>
                                )}
                            </CardBody>
                        </Card>

                        <Heading size="md" mb={4}>Your Answers</Heading>
                        <VStack spacing={6} align="stretch">
                            {results && results.answers ? (
                                <Card boxShadow="sm">
                                    <CardBody>
                                        <Stack divider={<StackDivider />} spacing="6">
                                            {results.answers.map((answer, index) => (
                                                <Box key={index}>
                                                    <Flex 
                                                        justify="space-between" 
                                                        align="center" 
                                                        bg={answerBg} 
                                                        p={3} 
                                                        borderRadius="md"
                                                        mb={4}
                                                    >
                                                        <Heading size="sm">Question {index + 1}</Heading>
                                                        
                                                        {isEvaluated && answer.score !== undefined && (
                                                            <Badge 
                                                                colorScheme={getScoreColor(answer.score)}
                                                                py={1} 
                                                                px={3} 
                                                                borderRadius="md"
                                                            >
                                                                {answer.score}%
                                                            </Badge>
                                                        )}
                                                    </Flex>
                                                    
                                                    <Text fontSize="sm" color="gray.500" mb={4}>
                                                        Question ID: {answer.questionId}
                                                    </Text>
                                                    
                                                    <Box 
                                                        bg="white" 
                                                        p={4} 
                                                        borderRadius="md" 
                                                        borderWidth="1px" 
                                                        borderColor="gray.200"
                                                        mb={4}
                                                    >
                                                        <Text fontWeight="medium" mb={2}>Your Answer:</Text>
                                                        <Text whiteSpace="pre-wrap">
                                                            {answer.answer}
                                                        </Text>
                                                    </Box>
                                                    
                                                    {isEvaluated && answer.score !== undefined ? (
                                                        <Box 
                                                            bg={feedbackBg}
                                                            p={4}
                                                            borderRadius="md"
                                                        >
                                                            <Flex align="center" mb={3}>
                                                                <Icon as={FaCommentAlt} color="blue.500" mr={2} />
                                                                <Text fontWeight="medium">Feedback:</Text>
                                                            </Flex>
                                                            <Text 
                                                                color={feedbackTextColor} 
                                                                fontStyle="italic"
                                                                p={3}
                                                                bg={feedbackTextBg}
                                                                borderRadius="md"
                                                                borderLeft="4px solid"
                                                                borderColor="blue.500"
                                                            >
                                                                {answer.feedback || "No specific feedback provided."}
                                                            </Text>
                                                        </Box>
                                                    ) : (
                                                        <Alert status="info" borderRadius="md">
                                                            <AlertIcon />
                                                            <Text fontStyle="italic">
                                                                {results.message || "Your answer has been submitted and is awaiting evaluation."}
                                                            </Text>
                                                        </Alert>
                                                    )}

                                                    {isEvaluated && (
                                                        <Box mt={4}>
                                                            <Heading size="sm" mb={2}>Queries</Heading>
                                                            {queries.filter(q => q.questionId === answer.questionId).map((query, idx) => (
                                                                <Box key={idx} mb={4} p={3} bg="gray.50" borderRadius="md">
                                                                    <Flex justify="space-between" mb={2}>
                                                                        <Text fontWeight="medium">Your Query:</Text>
                                                                        <Badge 
                                                                            colorScheme={query.status === 'resolved' ? 'green' : 'orange'}
                                                                            fontSize="xs"
                                                                        >
                                                                            {query.status}
                                                                        </Badge>
                                                                    </Flex>
                                                                    <Text mb={3} whiteSpace="pre-wrap">{query.message}</Text>
                                                                    {query.response && (
                                                                        <>
                                                                            <Text fontWeight="medium">Teacher's Response:</Text>
                                                                            <Text whiteSpace="pre-wrap" fontStyle="italic">{query.response}</Text>
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            ))}

                                                            {showQueryForm && currentQuestionId === answer.questionId ? (
                                                                <Box mt={3}>
                                                                    <Textarea
                                                                        value={newQuery}
                                                                        onChange={(e) => setNewQuery(e.target.value)}
                                                                        placeholder="Enter your query about this question..."
                                                                        mb={2}
                                                                    />
                                                                    <Flex justify="flex-end" gap={2}>
                                                                        <Button 
                                                                            size="sm" 
                                                                            onClick={() => setShowQueryForm(false)}
                                                                            variant="outline"
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            colorScheme="blue"
                                                                            onClick={handleSubmitQuery}
                                                                            isLoading={submittingQuery}
                                                                            leftIcon={<FaReply />}
                                                                        >
                                                                            Submit Query
                                                                        </Button>
                                                                    </Flex>
                                                                </Box>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    leftIcon={<FaQuestionCircle />}
                                                                    onClick={() => {
                                                                        setCurrentQuestionId(answer.questionId);
                                                                        setShowQueryForm(true);
                                                                    }}
                                                                >
                                                                    Ask a Question
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            ))}
                                        </Stack>
                                    </CardBody>
                                </Card>
                            ) : (
                                <Alert status="info" borderRadius="md">
                                    <AlertIcon />
                                    No answers found for this attempt.
                                </Alert>
                            )}
                        </VStack>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

export default ExamResultsPage;