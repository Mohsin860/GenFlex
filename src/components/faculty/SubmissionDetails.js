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
    Divider,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Card,
    CardBody,
    CardHeader,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Textarea,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Container,
    Flex,
    useColorModeValue,
    Icon,
    Grid,
    GridItem,
    Stack,
    ButtonGroup,
    Tooltip
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import {
    getSubmissionDetails,
    publishSubmissionResults,
    deleteSubmission,
    updateEvaluation
} from '../../services/teacherExamService';
import { evaluateEssaySubmission, evaluateMathSubmission, evaluateCodingSubmission } from '../../services/evaluationService';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { FaEdit, FaCheck, FaTrash, FaSave, FaUndo, FaEye, FaRocket, FaCode } from 'react-icons/fa';


const SubmissionDetails = () => {
    const { submissionId } = useParams();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isEditing, setIsEditing] = useState(false);
    const [editedAnswers, setEditedAnswers] = useState([]);
    const [editedTotalScore, setEditedTotalScore] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const deleteDialogDisclosure = useDisclosure();

    // Color mode values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.700');
    const accentBg = useColorModeValue('blue.50', 'blue.900');
    const statBg = useColorModeValue('gray.50', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const answerBg = useColorModeValue('gray.50', 'gray.800');
    const evaluationBg = useColorModeValue('blue.50', 'blue.900');
    const tabSelected = useColorModeValue('teal.500', 'teal.300');

    const fetchSubmissionDetails = async () => {
        try {
            setLoading(true);
            const response = await getSubmissionDetails(submissionId);
            console.log("Submission details:", response); // Debug
            setSubmission(response.submission);
        } catch (error) {
            console.error('Error fetching submission details:', error);
            setError('Failed to load submission details. Please try again later.');
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load submission details',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (submissionId) {
            fetchSubmissionDetails();
        }
    }, [submissionId]);

    // Initialize edited answers when submission changes
    useEffect(() => {
        if (submission && submission.answers) {
            setEditedAnswers(submission.answers.map(answer => ({
                answerId: answer._id,
                score: answer.score || 0,
                feedback: answer.feedback || ''
            })));
            setEditedTotalScore(submission.totalScore || 0);
        }
    }, [submission]);

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
        const colorMap = {
            submitted: 'blue',
            evaluated: 'green',
            reviewing: 'orange'
        };
        return (
            <Badge
                colorScheme={colorMap[status] || 'gray'}
                py={1}
                px={2}
                borderRadius="md"
                fontSize="sm"
            >
                {status}
            </Badge>
        );
    };

    const getDefaultLanguage = () => {
        if (!submission) return 'plaintext';

        if (submission.examType === 'CodingExam') {
            return 'javascript'; // Default for code, can be enhanced to detect language
        }

        return 'plaintext'; // Default for essay exams
    };

    const handleEvaluateSubmission = async () => {
        try {
            setEvaluating(true);

            // Using optional chaining (?.) to safely access submission.exam.type
            const isMathExam = submission.examType === 'CodingExam' &&
                (submission.exam?.type === 'math' || submission.examTitle.toLowerCase().includes('math'));

            const isCodingExam = submission.examType === 'CodingExam' &&
                (['coding', 'complex', 'diverse'].includes(submission.exam?.type) ||
                    submission.examTitle.toLowerCase().includes('coding') ||
                    submission.examTitle.toLowerCase().includes('programming'));

            // Call appropriate evaluation endpoint
            let response;
            if (isMathExam) {
                response = await evaluateMathSubmission(submissionId);
            } else if (isCodingExam) {
                response = await evaluateCodingSubmission(submissionId);
            } else {
                response = await evaluateEssaySubmission(submissionId);
            }

            toast({
                title: 'Evaluation Complete',
                description: `The submission has been evaluated with a score of ${response.totalScore}%`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Refresh submission data to get updated scores and feedback
            await fetchSubmissionDetails();

            onClose(); // Close modal
        } catch (error) {
            toast({
                title: 'Evaluation Failed',
                description: error.response?.data?.message || 'Failed to evaluate submission',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setEvaluating(false);
        }
    };

    const handlePublishResults = async () => {
        try {
            setPublishing(true);
            await publishSubmissionResults(submissionId);

            toast({
                title: 'Results Published',
                description: 'The student can now see their evaluation results',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Refresh submission data to get updated publication status
            await fetchSubmissionDetails();
        } catch (error) {
            toast({
                title: 'Publication Failed',
                description: error.response?.data?.message || 'Failed to publish results',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setPublishing(false);
        }
    };

    const handleDeleteSubmission = async () => {
        try {
            setDeleting(true);
            await deleteSubmission(submissionId);

            toast({
                title: 'Submission Deleted',
                description: 'The submission has been deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            navigate(`/exam-submissions/${submission.examType}/${submission.examId}`);
        } catch (error) {
            toast({
                title: 'Deletion Failed',
                description: error.response?.data?.message || 'Failed to delete submission',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setDeleting(false);
            deleteDialogDisclosure.onClose();
        }
    };

    // Handler for updating the score
    const handleScoreChange = (index, value) => {
        const newAnswers = [...editedAnswers];
        newAnswers[index].score = Number(value);
        setEditedAnswers(newAnswers);

        // Recalculate total score
        const sum = newAnswers.reduce((total, a) => total + (a.score || 0), 0);
        const avg = Math.round(sum / newAnswers.length);
        setEditedTotalScore(avg);
    };

    // Handler for updating the feedback
    const handleFeedbackChange = (index, value) => {
        const newAnswers = [...editedAnswers];
        newAnswers[index].feedback = value;
        setEditedAnswers(newAnswers);
    };

    // Save edits
    const handleSaveEdits = async () => {
        try {
            setLoading(true);
            await updateEvaluation(submissionId, {
                answers: editedAnswers,
                totalScore: editedTotalScore
            });

            toast({
                title: 'Evaluation Updated',
                description: 'The evaluation has been updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Refresh submission data
            await fetchSubmissionDetails();
            setIsEditing(false);
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: error.response?.data?.message || 'Failed to update evaluation',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box bg={bgColor} minH="calc(100vh - 150px)" py={8} textAlign="center">
                <Container maxW="container.xl">
                    <Flex direction="column" align="center" justify="center" py={10}>
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                        <Text mt={4} fontSize="lg" fontWeight="medium">Loading submission details...</Text>
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

    if (!submission) {
        return (
            <Box bg={bgColor} minH="calc(100vh - 150px)" py={8}>
                <Container maxW="container.xl">
                    <Card bg={cardBg} boxShadow="md">
                        <CardBody>
                            <Alert status="warning" borderRadius="md">
                                <AlertIcon />
                                <Text>Submission not found</Text>
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

    const goToSubmissionsList = () => {
        navigate(`/exam-submissions/${submission.examType}/${submission.examId}`);
    };

    const isEssayExam = submission.examType === 'Exam';

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
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={goToSubmissionsList}>
                                            Student Submissions
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbItem isCurrentPage>
                                        <BreadcrumbLink>Submission Details</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </Breadcrumb>
                                <Heading size="lg">{submission.examTitle}</Heading>
                            </Box>
                            <ButtonGroup>
                                <Button
                                    leftIcon={<ChevronLeftIcon />}
                                    colorScheme="gray"
                                    onClick={goToSubmissionsList}
                                    size="sm"
                                >
                                    Back to Submissions
                                </Button>
                            </ButtonGroup>
                        </Flex>
                    </CardHeader>
                    <CardBody>
                        {/* Display info when in editing mode */}
                        {isEditing && (
                            <Alert status="info" mb={6} borderRadius="md">
                                <AlertIcon />
                                <VStack align="start" spacing={2} width="100%">
                                    <Text>You are editing this evaluation. New calculated total score: {editedTotalScore}%</Text>
                                    <Text fontSize="sm">Note: Publishing this evaluation will make it visible to the student.</Text>
                                </VStack>
                            </Alert>
                        )}

                        <Grid
                            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
                            gap={6}
                            mb={6}
                        >
                            <Card bg={statBg} boxShadow="sm">
                                <CardBody>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium" mb={2}>Student</StatLabel>
                                        <StatNumber fontSize="xl">{submission.student.name}</StatNumber>
                                        <StatHelpText mb={0}>{submission.student.email}</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>

                            <Card bg={statBg} boxShadow="sm">
                                <CardBody>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium" mb={2}>Submission</StatLabel>
                                        <StatNumber fontSize="xl">{formatDate(submission.submittedAt)}</StatNumber>
                                        <HStack spacing={2} mt={2}>
                                            <StatHelpText mb={0}>Status:</StatHelpText>
                                            {getStatusBadge(submission.status)}
                                        </HStack>
                                    </Stat>
                                </CardBody>
                            </Card>

                            <Card bg={statBg} boxShadow="sm">
                                <CardBody>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium" mb={2}>Evaluation</StatLabel>
                                        <StatNumber fontSize="xl" color={submission.status === 'evaluated' ? 'green.500' : 'gray.500'}>
                                            {submission.status === 'evaluated'
                                                ? `${submission.totalScore}%`
                                                : 'Pending Evaluation'}
                                        </StatNumber>
                                        {submission.evaluatedAt && (
                                            <StatHelpText>
                                                Evaluated: {formatDate(submission.evaluatedAt)}
                                            </StatHelpText>
                                        )}
                                        {submission.status === 'evaluated' && (
                                            <Badge
                                                colorScheme={submission.resultsPublished ? "green" : "yellow"}
                                                mt={1}
                                                py={1}
                                                px={2}
                                                borderRadius="md"
                                                fontSize="sm"
                                            >
                                                {submission.resultsPublished ? "Results Published" : "Results Not Published"}
                                            </Badge>
                                        )}
                                    </Stat>
                                </CardBody>
                            </Card>


                        </Grid>

                        <Heading size="md" mb={4}>Student Answers</Heading>

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
                                {submission.answers.map((_, index) => (
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
                                        Question {index + 1}
                                    </Tab>
                                ))}
                            </TabList>

                            <TabPanels>
                                {submission.answers.map((answer, index) => (
                                    <TabPanel key={index} px={0}>
                                        <VStack spacing={4} align="stretch">
                                            {/* Student Answer Card */}
                                            <Card bg={answerBg} boxShadow="sm">
                                                <CardHeader pb={0}>
                                                    <Heading size="sm">Student's Answer</Heading>
                                                </CardHeader>
                                                <CardBody>
                                                    <Box height="300px" borderRadius="md" overflow="hidden" boxShadow="inner">
                                                        <Editor
                                                            height="100%"
                                                            defaultLanguage={getDefaultLanguage()}
                                                            value={answer.answer || ''}
                                                            options={{
                                                                readOnly: true,
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

                                            {/* Only show evaluation and queries if submission is evaluated */}
                                            {submission.status === 'evaluated' && (
                                                <>
                                                    {/* Evaluation Card */}
                                                    <Card bg={evaluationBg} boxShadow="sm">
                                                        <CardHeader pb={0}>
                                                            <Heading size="sm">Evaluation</Heading>
                                                        </CardHeader>
                                                        <CardBody>
                                                            {isEditing ? (
                                                                <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                                                                    <GridItem colSpan={{ base: 12, md: 3 }}>
                                                                        <FormControl>
                                                                            <FormLabel fontWeight="medium">Score (0-100)</FormLabel>
                                                                            <NumberInput
                                                                                min={0}
                                                                                max={100}
                                                                                value={editedAnswers[index]?.score || 0}
                                                                                onChange={(value) => handleScoreChange(index, value)}
                                                                                size="md"
                                                                                boxShadow="sm"
                                                                                borderRadius="md"
                                                                            >
                                                                                <NumberInputField />
                                                                                <NumberInputStepper>
                                                                                    <NumberIncrementStepper />
                                                                                    <NumberDecrementStepper />
                                                                                </NumberInputStepper>
                                                                            </NumberInput>
                                                                        </FormControl>
                                                                    </GridItem>
                                                                    <GridItem colSpan={{ base: 12, md: 9 }}>
                                                                        <FormControl>
                                                                            <FormLabel fontWeight="medium">Feedback</FormLabel>
                                                                            <Textarea
                                                                                value={editedAnswers[index]?.feedback || ''}
                                                                                onChange={(e) => handleFeedbackChange(index, e.target.value)}
                                                                                placeholder="Provide feedback on this answer"
                                                                                rows={4}
                                                                                boxShadow="sm"
                                                                                borderRadius="md"
                                                                                resize="vertical"
                                                                            />
                                                                        </FormControl>
                                                                    </GridItem>
                                                                </Grid>
                                                            ) : (
                                                                <VStack align="start" spacing={3}>
                                                                    <HStack>
                                                                        <Text fontWeight="medium">Score:</Text>
                                                                        <Badge
                                                                            colorScheme={answer.score >= 70 ? "green" : answer.score >= 50 ? "yellow" : "red"}
                                                                            py={1}
                                                                            px={2}
                                                                            borderRadius="md"
                                                                        >
                                                                            {answer.score} / 100
                                                                        </Badge>
                                                                    </HStack>
                                                                    <Box>
                                                                        <Text fontWeight="medium" mb={1}>Feedback:</Text>
                                                                        <Card variant="outline" p={3} borderRadius="md" boxShadow="sm">
                                                                            <Text>{answer.feedback || 'No feedback provided'}</Text>
                                                                        </Card>
                                                                    </Box>
                                                                </VStack>
                                                            )}
                                                        </CardBody>
                                                    </Card>

                                                    {/* Student Queries Card - only shown if there are queries for this question */}
                                                    {submission.queries?.filter(q => q.questionId === answer.questionId).length > 0 && (
                                                        <Card bg="gray.50" boxShadow="sm">
                                                            <CardHeader pb={0}>
                                                                <Heading size="sm">Student Queries</Heading>
                                                            </CardHeader>
                                                            <CardBody>
                                                                {submission.queries?.filter(q => q.questionId === answer.questionId).map((query, idx) => (
                                                                    <Box key={idx} mb={4} p={3} bg="white" borderRadius="md">
                                                                        <Text fontWeight="medium">Student Query:</Text>
                                                                        <Text mb={2}>{query.message}</Text>
                                                                        {query.response && (
                                                                            <>
                                                                                <Text fontWeight="medium">Your Response:</Text>
                                                                                <Text>{query.response}</Text>
                                                                            </>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                            </CardBody>
                                                        </Card>
                                                    )}
                                                </>
                                            )}
                                        </VStack>
                                    </TabPanel>
                                ))}
                            </TabPanels>
                        </Tabs>

                        <Flex
                            justifyContent="flex-end"
                            gap={3}
                            wrap="wrap"
                            borderTop="1px"
                            borderColor="gray.200"
                            pt={6}
                        >
                            {/* Evaluation Button */}
                            {submission.status !== 'evaluated' &&
                                (isEssayExam ||
                                    (submission.examType === 'CodingExam' && submission.exam?.type === 'math') ||
                                    (submission.examType === 'CodingExam' && ['coding', 'complex', 'diverse'].includes(submission.exam?.type))) && (
                                    <Button
                                        colorScheme="teal"
                                        onClick={onOpen}
                                        leftIcon={<Icon as={FaRocket} />}
                                        size="md"
                                        boxShadow="md"
                                        _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                        transition="all 0.2s"
                                    >
                                        Evaluate Submission
                                    </Button>
                                )}


                            {/* Edit mode buttons */}
                            {submission.status === 'evaluated' && !submission.resultsPublished && !isEditing && (
                                <Button
                                    colorScheme="orange"
                                    onClick={() => setIsEditing(true)}
                                    leftIcon={<Icon as={FaEdit} />}
                                    size="md"
                                    boxShadow="md"
                                    _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                    transition="all 0.2s"
                                >
                                    Edit Evaluation
                                </Button>
                            )}

                            {isEditing && (
                                <>
                                    <Button
                                        colorScheme="green"
                                        onClick={handleSaveEdits}
                                        isLoading={loading}
                                        loadingText="Saving..."
                                        leftIcon={<Icon as={FaSave} />}
                                        size="md"
                                        boxShadow="md"
                                        _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                        transition="all 0.2s"
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        colorScheme="gray"
                                        onClick={() => setIsEditing(false)}
                                        isDisabled={loading}
                                        leftIcon={<Icon as={FaUndo} />}
                                        size="md"
                                        boxShadow="md"
                                        _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                        transition="all 0.2s"
                                    >
                                        Cancel Editing
                                    </Button>
                                </>
                            )}

                            {/* Publish button (only visible when not in edit mode) */}
                            {submission.status === 'evaluated' && !submission.resultsPublished && !isEditing && (
                                <Button
                                    colorScheme="green"
                                    onClick={handlePublishResults}
                                    isLoading={publishing}
                                    loadingText="Publishing..."
                                    leftIcon={<Icon as={FaEye} />}
                                    size="md"
                                    boxShadow="md"
                                    _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                    transition="all 0.2s"
                                >
                                    Publish Results to Student
                                </Button>
                            )}

                            {/* Delete button */}
                            <Button
                                colorScheme="red"
                                onClick={deleteDialogDisclosure.onOpen}
                                leftIcon={<Icon as={FaTrash} />}
                                size="md"
                                boxShadow="md"
                                _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                transition="all 0.2s"
                            >
                                Delete Submission
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>
            </Container>

            {/* Evaluation Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {submission.examType === 'CodingExam' && submission.exam?.type === 'math'
                            ? 'Confirm Math Evaluation'
                            : submission.examType === 'CodingExam' && ['coding', 'complex', 'diverse'].includes(submission.exam?.type)
                                ? 'Confirm Coding Evaluation'
                                : 'Confirm AI Evaluation'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {submission.examType === 'CodingExam' && submission.exam?.type === 'math' ? (
                            <Text>
                                This will evaluate the student's math answers against your reference solutions.
                                The evaluation checks for mathematical equivalence and understanding.
                            </Text>
                        ) : submission.examType === 'CodingExam' && ['coding', 'complex', 'diverse'].includes(submission.exam?.type) ? (
                            <Text>
                                This will evaluate the student's code solutions against your reference code.
                                The evaluation checks the code structure, logic, and expected output.
                            </Text>
                        ) : (
                            <Text>
                                This will use AI to evaluate the student's essay answers against your reference solutions.
                                The evaluation considers semantic similarity and key concept detection.
                            </Text>
                        )}
                        <Alert status="info" mt={4}>
                            <AlertIcon />
                            <Text>Make sure you have provided reference solutions for the questions.</Text>
                        </Alert>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="gray" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleEvaluateSubmission}
                            isLoading={evaluating}
                            loadingText="Evaluating..."
                        >
                            Evaluate
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={deleteDialogDisclosure.isOpen} onClose={deleteDialogDisclosure.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Deletion</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Alert status="error" borderRadius="md">
                            <AlertIcon />
                            <Text>Are you sure you want to delete this submission? This action cannot be undone.</Text>
                        </Alert>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="gray"
                            mr={3}
                            onClick={deleteDialogDisclosure.onClose}
                            isDisabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDeleteSubmission}
                            isLoading={deleting}
                            loadingText="Deleting..."
                        >
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default SubmissionDetails;