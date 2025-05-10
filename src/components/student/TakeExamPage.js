import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, 
    Heading, 
    VStack, 
    Button, 
    FormControl, 
    FormLabel, 
    Textarea,
    Card, 
    CardBody, 
    CardHeader,
    // Stack,  // Unused import
    // StackDivider, // Unused import 
    Text, 
    Spinner, 
    useToast,
    Badge, 
    HStack, 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbLink, 
    Alert,
    AlertIcon, 
    AlertTitle, 
    AlertDescription,
    Container,
    Flex,
    Icon,
    useColorModeValue,
    ButtonGroup,
    Progress,
    // Tooltip, // Unused import
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
} from '@chakra-ui/react';
import { getExamById, submitExamAttempt } from '../../services/studentExamService';
import Editor from '@monaco-editor/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { FaSave, FaTimes, FaCode, FaPencilAlt, FaCalculator, FaClock } from 'react-icons/fa';
// Removed FaExclamationTriangle from imports as it's not being used

const TakeExamPage = () => {
    const { examId, examType } = useParams();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [timerExpired, setTimerExpired] = useState(false);
    const [examStartTime, setExamStartTime] = useState(null);
    const timerIntervalRef = useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const toast = useToast();

    // Color mode values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.700');
    const headerBg = useColorModeValue('blue.50', 'blue.900');
    const questionBg = useColorModeValue('gray.50', 'gray.800');
    // const hoverBg = useColorModeValue('gray.50', 'gray.700'); // Unused variable
    const timerBgNormal = useColorModeValue('blue.50', 'blue.800');
    const timerBgWarning = useColorModeValue('red.50', 'red.800');
    // Pre-define timer warning color to avoid hooks in functions
    const orangeBgColor = useColorModeValue('orange.50', 'orange.800');
    
    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const response = await getExamById(examId, examType);
                console.log("Exam data received:", response.exam); // Debug exam data
                setExam(response.exam);
                
                // Initialize answers object
                const initialAnswers = {};
                if (response.exam?.questions) {
                    response.exam.questions.forEach((question, index) => {
                        const questionId = question._id || `question_${index}`;
                        initialAnswers[questionId] = '';
                    });
                }
                setAnswers(initialAnswers);

                // Initialize timer based on exam duration - default to 2 hours if not specified
                const examDuration = response.exam?.duration || 120;
                console.log("Exam duration:", examDuration, "minutes"); // Debug duration
                
                // Set initial time in seconds
                const durationSeconds = examDuration * 60;
                setTimeRemaining(durationSeconds);
                
                // Record start time
                const startTime = new Date();
                setExamStartTime(startTime.getTime());
                
                // Start the timer
                startTimer(durationSeconds);
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

        // Cleanup timer on unmount
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [examId, examType]); // Add startTimer as a dependency
    
    // Timer functions
    const startTimer = (initialSeconds) => {
        // Clear any existing interval
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        
        console.log("Starting timer with", initialSeconds, "seconds"); // Debug timer start
        
        timerIntervalRef.current = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    // Timer expired
                    clearInterval(timerIntervalRef.current);
                    setTimerExpired(true);
                    onOpen(); // Open the time's up modal
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };
    
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '--:--:--';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Update progress when answers change
    useEffect(() => {
        if (exam?.questions) {
            const answeredCount = Object.values(answers).filter(answer => answer.trim().length > 0).length;
            const totalQuestions = exam.questions.length;
            setProgress((answeredCount / totalQuestions) * 100);
        }
    }, [answers, exam]);

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    // New function for handling code editor changes
    const handleEditorChange = (value, questionId) => {
        handleAnswerChange(questionId, value);
    };

    const handleSubmit = async () => {
        // If timer has expired, no need to validate for empty answers
        if (!timerExpired && Object.values(answers).some(answer => !answer.trim())) {
            toast({
                title: 'Incomplete Answers',
                description: 'Please answer all questions before submitting.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            setSubmitting(true);
            
            // Clear timer on submission
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
            
            // Format answers for submission
            const formattedAnswers = Object.keys(answers).map(questionId => ({
                questionId,
                answer: answers[questionId]
            }));

            const response = await submitExamAttempt({
                examId,
                examType,
                answers: formattedAnswers,
                startedAt: examStartTime,
                timerExpired: timerExpired
            });

            toast({
                title: 'Exam Submitted',
                description: 'Your exam has been submitted successfully.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Redirect to the results page if available, otherwise back to dashboard
            if (response.attemptId) {
                navigate(`/exam-results/${response.attemptId}`);
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            toast({
                title: 'Submission Failed',
                description: 'Failed to submit your exam. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getExamTypeBadge = () => {
        if (!exam) return null;
        
        let type = '';
        let color = '';
        let icon = null;
        
        if (examType === 'Exam') {
            type = 'Essay';
            color = 'blue';
            icon = FaPencilAlt;
        } else if (examType === 'CodingExam') {
            if (exam.type === 'math') {
                type = 'Math';
                color = 'purple';
                icon = FaCalculator;
            } else if (exam.type === 'complex') {
                type = 'Complex';
                color = 'red';
                icon = FaCode;
            } else if (exam.type === 'diverse') {
                type = 'Diverse Coding';
                color = 'orange';
                icon = FaCode;
            } else {
                type = 'Coding';
                color = 'green';
                icon = FaCode;
            }
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
                {icon && <Icon as={icon} mr={1} boxSize={3} />}
                {type}
            </Badge>
        );
    };
    
    // Time remaining warnings - Fixed to not use hook inside function
    const getTimeRemainingStatus = () => {
        if (timeRemaining === null) return { status: 'normal', text: 'Time remaining' };
        
        if (timeRemaining <= 300) { // Less than 5 minutes
            return { 
                status: 'critical', 
                text: 'Time almost up!',
                color: 'red.500',
                bg: timerBgWarning
            };
        }
        
        if (timeRemaining <= 600) { // Less than 10 minutes
            return {
                status: 'warning',
                text: 'Time running low',
                color: 'orange.500',
                bg: orangeBgColor // Using pre-defined color variable
            };
        }
        
        return { 
            status: 'normal', 
            text: 'Time remaining',
            color: 'blue.500',
            bg: timerBgNormal
        };
    };

    // Function to determine which programming language to use as default
    const getDefaultLanguage = (questionText) => {
        const lowerCaseQuestion = questionText.toLowerCase();
        if (lowerCaseQuestion.includes('python')) return 'python';
        if (lowerCaseQuestion.includes('javascript') || lowerCaseQuestion.includes('js')) return 'javascript';
        if (lowerCaseQuestion.includes('java')) return 'java';
        if (lowerCaseQuestion.includes('c++')) return 'cpp';
        if (lowerCaseQuestion.includes('c#')) return 'csharp';
        return 'python'; // Default to Python if no language is specified
    };

    // Function to render the appropriate answer input based on exam type
    const renderAnswerInput = (question, questionId) => {
        const isCodingExam = examType === 'CodingExam';
        const questionText = question.question || '';
        
        if (isCodingExam && exam.type !== 'math') {
            // Render code editor for coding questions
            return (
                <Box 
                    height="350px" 
                    borderRadius="md" 
                    overflow="hidden" 
                    boxShadow="sm"
                >
                    <Editor
                        height="100%"
                        defaultLanguage={getDefaultLanguage(questionText)}
                        value={answers[questionId] || ''}
                        onChange={(value) => handleEditorChange(value, questionId)}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            fontSize: 14,
                            wordWrap: 'on'
                        }}
                    />
                </Box>
            );
        } else {
            // Render regular textarea for essay and math questions
            return (
                <Textarea
                    placeholder="Type your answer here..."
                    value={answers[questionId] || ''}
                    onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                    minHeight="200px"
                    fontSize="md"
                    resize="vertical"
                    boxShadow="sm"
                    borderRadius="md"
                    _focus={{
                        borderColor: 'blue.400',
                        boxShadow: 'outline'
                    }}
                />
            );
        }
    };

    // Go to next question
    const goToNextQuestion = () => {
        if (exam?.questions && currentQuestionIndex < exam.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // Go to previous question
    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (loading) {
        return (
            <Box bg={bgColor} minH="calc(100vh - 150px)" py={8} textAlign="center">
                <Container maxW="container.xl">
                    <Flex direction="column" align="center" justify="center" py={10}>
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text mt={4} fontSize="lg" fontWeight="medium">Loading exam...</Text>
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

    if (!exam) {
        return (
            <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
                <Container maxW="container.xl">
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody>
                            <Alert status="warning" borderRadius="md">
                                <AlertIcon />
                                <AlertTitle mr={2}>Exam Not Found</AlertTitle>
                                <AlertDescription>The requested exam could not be found.</AlertDescription>
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
    
    const timeStatus = getTimeRemainingStatus();

    return (
        <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
            <Container maxW="container.xl">
                {/* Timer Card - Always Visible at Top */}
                <Card 
                    bg={timeStatus.bg} 
                    boxShadow="md" 
                    mb={4} 
                    borderWidth={2} 
                    borderColor={timeStatus.status === 'critical' ? 'red.500' : 'transparent'}
                >
                    <CardBody>
                        <Flex justify="space-between" align="center">
                            <Stat>
                                <StatLabel color={timeStatus.color} fontWeight="bold">{timeStatus.text}</StatLabel>
                                <StatNumber fontSize="2xl" color={timeStatus.color}>
                                    <Flex align="center">
                                        <Icon as={FaClock} mr={2} />
                                        {formatTime(timeRemaining)}
                                    </Flex>
                                </StatNumber>
                                <StatHelpText>
                                    {exam.duration ? `${exam.duration} minute exam` : 'Exam in progress'}
                                </StatHelpText>
                            </Stat>
                            
                            <Box>
                                <Text fontWeight="medium" mb={1}>Completion: {Math.round(progress)}%</Text>
                                <Progress 
                                    value={progress} 
                                    size="sm" 
                                    width="150px" 
                                    colorScheme="green" 
                                    borderRadius="md"
                                />
                            </Box>
                        </Flex>
                    </CardBody>
                </Card>
                
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
                                        <BreadcrumbLink>Take Exam</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </Breadcrumb>
                                <Flex align="center" gap={3}>
                                    <Heading size="lg">{exam.title}</Heading>
                                    {getExamTypeBadge()}
                                </Flex>
                            </Box>
                        </Flex>
                    </CardHeader>
                    
                    <CardBody p={6}>
                        <VStack spacing={6} align="stretch">
                            {exam.questions && exam.questions.length > 0 && (
                                <>
                                    <Box>
                                        <HStack mb={4} justify="space-between">
                                            <Text fontWeight="medium">Question {currentQuestionIndex + 1} of {exam.questions.length}</Text>
                                            <HStack>
                                                <Button 
                                                    size="sm" 
                                                    onClick={goToPrevQuestion} 
                                                    isDisabled={currentQuestionIndex === 0}
                                                    colorScheme="gray"
                                                >
                                                    Previous
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={goToNextQuestion}
                                                    isDisabled={currentQuestionIndex === exam.questions.length - 1}
                                                    colorScheme="gray"
                                                >
                                                    Next
                                                </Button>
                                            </HStack>
                                        </HStack>
                                        
                                        <Card variant="outline" bg={questionBg} boxShadow="sm" mb={4}>
                                            <CardBody>
                                                <FormControl isRequired>
                                                    <FormLabel fontWeight="bold" fontSize="lg">
                                                        Question {currentQuestionIndex + 1}:
                                                    </FormLabel>
                                                    <Text 
                                                        fontSize="md" 
                                                        mb={6}
                                                        p={3}
                                                        bg={cardBg}
                                                        borderRadius="md"
                                                        borderLeft="4px solid"
                                                        borderColor="blue.500"
                                                    >
                                                        {exam.questions[currentQuestionIndex].question || ''}
                                                    </Text>
                                                    
                                                    <Text fontWeight="medium" mb={2}>Your Answer:</Text>
                                                    {renderAnswerInput(
                                                        exam.questions[currentQuestionIndex], 
                                                        exam.questions[currentQuestionIndex]._id || `question_${currentQuestionIndex}`
                                                    )}
                                                </FormControl>
                                            </CardBody>
                                        </Card>
                                    </Box>
                                    
                                    <HStack mt={4} spacing={4} wrap="wrap">
                                        <ButtonGroup width="full" spacing={4}>
                                            <Button
                                                colorScheme="gray"
                                                onClick={() => navigate('/student-dashboard')}
                                                isDisabled={submitting}
                                                leftIcon={<Icon as={FaTimes} />}
                                                size="md"
                                                boxShadow="sm"
                                                flex="1"
                                                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                                transition="all 0.2s"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                colorScheme="blue"
                                                onClick={handleSubmit}
                                                isLoading={submitting}
                                                loadingText="Submitting..."
                                                leftIcon={<Icon as={FaSave} />}
                                                size="md"
                                                boxShadow="sm"
                                                flex="2"
                                                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                                transition="all 0.2s"
                                            >
                                                Submit Exam
                                            </Button>
                                        </ButtonGroup>
                                    </HStack>
                                </>
                            )}
                        </VStack>
                    </CardBody>
                </Card>
                
                {/* Quick Navigation Panel */}
                <Card bg={cardBg} boxShadow="md" mb={6}>
                    <CardBody>
                        <Text fontWeight="medium" mb={4}>Quick Navigation</Text>
                        <Flex flexWrap="wrap" gap={2}>
                            {exam.questions && exam.questions.map((_, index) => (
                                <Button 
                                    key={index}
                                    size="sm"
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    colorScheme={answers[exam.questions[index]._id || `question_${index}`]?.trim() 
                                        ? "green" 
                                        : "gray"
                                    }
                                    variant={currentQuestionIndex === index ? "solid" : "outline"}
                                >
                                    {index + 1}
                                </Button>
                            ))}
                        </Flex>
                    </CardBody>
                </Card>
                
                {/* Time's Up Modal */}
                <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} closeOnEsc={false}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader bg="red.500" color="white">Time's Up!</ModalHeader>
                        <ModalBody py={6}>
                            <VStack spacing={4} align="stretch">
                                <Alert status="warning">
                                    <AlertIcon />
                                    <Box>
                                        <AlertTitle>The exam time has expired</AlertTitle>
                                        <AlertDescription>
                                            Your answers will be automatically submitted.
                                        </AlertDescription>
                                    </Box>
                                </Alert>
                                <Text>
                                    You've reached the end of the allowed time for this exam. Your current answers will be submitted now.
                                </Text>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button 
                                colorScheme="blue" 
                                onClick={handleSubmit}
                                isLoading={submitting}
                                width="full"
                            >
                                Submit Exam
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Container>
        </Box>
    );
};

export default TakeExamPage;