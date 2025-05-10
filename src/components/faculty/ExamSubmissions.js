import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    useToast,
    Spinner,
    Text,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Alert,
    AlertIcon,
    Flex,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    SimpleGrid,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Container,
    Card,
    CardHeader,
    CardBody,
    useColorModeValue,
    HStack,
    Icon,
    ButtonGroup,
    Tooltip,
    Grid,
} from '@chakra-ui/react';
import { getExamSubmissions, publishAllResults, deleteAllSubmissions } from '../../services/teacherExamService';
import { evaluateAllSubmissions, evaluateAllMathSubmissions, evaluateAllCodingSubmissions } from '../../services/evaluationService';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { FaRocket, FaBullhorn, FaTrash, FaEye, FaCheck, FaTimes, FaCode } from 'react-icons/fa';

const ExamSubmissions = () => {
    const { examType, examId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isPublishOpen,
        onOpen: onPublishOpen,
        onClose: onPublishClose
    } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose
    } = useDisclosure();

    // Color mode values
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.700');
    const accentBg = useColorModeValue('blue.50', 'blue.900');
    const statBg = useColorModeValue('white', 'gray.700');
    const tableBg = useColorModeValue('white', 'gray.700');
    const tableHeadBg = useColorModeValue('gray.50', 'gray.800');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await getExamSubmissions(examType, examId);
            console.log("Submissions response:", response); // Debug
            setSubmissions(response.submissions || []);
            setExam(response.exam);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions. Please try again later.');
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load submissions',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId && examType) {
            fetchSubmissions();
        }
    }, [examId, examType]);

    const viewSubmissionDetails = (submissionId) => {
        navigate(`/submission-details/${submissionId}`);
    };

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

    const getPublishStatusBadge = (isPublished) => {
        return isPublished ? (
            <Badge
                colorScheme="green"
                py={1}
                px={2}
                borderRadius="md"
                fontSize="sm"
            >
                Published
            </Badge>
        ) : (
            <Badge
                colorScheme="yellow"
                py={1}
                px={2}
                borderRadius="md"
                fontSize="sm"
            >
                Not Published
            </Badge>
        );
    };

    const handleBulkEvaluation = async () => {
        try {
            setEvaluating(true);

            // Determine the exam type for appropriate evaluation
            const isMathExam = examType === 'CodingExam' && (exam.type === 'math' || exam.title.toLowerCase().includes('math'));
            const isCodingExam = examType === 'CodingExam' &&
                (['coding', 'complex', 'diverse'].includes(exam.type) ||
                    exam.title.toLowerCase().includes('coding') ||
                    exam.title.toLowerCase().includes('programming'));

            // Call appropriate evaluation endpoint
            let result;
            if (isMathExam) {
                result = await evaluateAllMathSubmissions(examId);
            } else if (isCodingExam) {
                result = await evaluateAllCodingSubmissions(examId);
            } else {
                result = await evaluateAllSubmissions(examType, examId);
            }

            toast({
                title: 'Evaluation Complete',
                description: result.message,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Refresh the submissions list
            await fetchSubmissions();
            onClose();
        } catch (error) {
            toast({
                title: 'Evaluation Failed',
                description: error.response?.data?.message || 'Failed to evaluate submissions',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setEvaluating(false);
        }
    };
    const handlePublishAllResults = async () => {
        try {
            setPublishing(true);
            const result = await publishAllResults(examType, examId);

            toast({
                title: 'Results Published',
                description: result.message,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Refresh the submissions list
            await fetchSubmissions();
            onPublishClose();
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

    const handleDeleteAllSubmissions = async () => {
        try {
            setLoading(true);
            const result = await deleteAllSubmissions(examType, examId);

            toast({
                title: 'Submissions Deleted',
                description: result.message,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Refresh the submissions list (should be empty now)
            await fetchSubmissions();
            onDeleteClose();
        } catch (error) {
            toast({
                title: 'Deletion Failed',
                description: error.response?.data?.message || 'Failed to delete submissions',
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
                        <Text mt={4} fontSize="lg" fontWeight="medium">Loading submissions...</Text>
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

    // Check if this is an essay exam (where evaluation works)
    const isEssayExam = examType === 'Exam';

    // Count pending submissions that need evaluation
    const pendingSubmissions = submissions.filter(sub => sub.status === 'submitted').length;

    // Count evaluated but unpublished submissions
    const unpublishedSubmissions = submissions.filter(
        sub => sub.status === 'evaluated' && !sub.resultsPublished
    ).length;

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
                                        <BreadcrumbLink>Student Submissions</BreadcrumbLink>
                                    </BreadcrumbItem>
                                </Breadcrumb>
                                <Heading size="lg">{exam?.title || 'Exam'} - Student Submissions</Heading>
                            </Box>

                            <ButtonGroup>
                                <Button
                                    leftIcon={<ChevronLeftIcon />}
                                    colorScheme="gray"
                                    onClick={() => navigate('/manage-exams')}
                                    size="sm"
                                >
                                    Back to Manage Exams
                                </Button>
                            </ButtonGroup>
                        </Flex>
                    </CardHeader>

                    <CardBody>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                            <Card bg={statBg} boxShadow="sm">
                                <CardBody>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium">Total Submissions</StatLabel>
                                        <StatNumber fontSize="2xl">{submissions.length}</StatNumber>
                                        <StatHelpText mb={0}>Students who attempted this exam</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>

                            <Card bg={statBg} boxShadow="sm">
                                <CardBody>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium">Evaluated</StatLabel>
                                        <StatNumber fontSize="2xl">
                                            {submissions.filter(sub => sub.status === 'evaluated').length}
                                        </StatNumber>
                                        <StatHelpText mb={0}>Submissions that have been graded</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>

                            <Card bg={statBg} boxShadow="sm">
                                <CardBody>
                                    <Stat>
                                        <StatLabel fontSize="md" fontWeight="medium">Average Score</StatLabel>
                                        <StatNumber fontSize="2xl" color="green.500">
                                            {submissions.length && submissions.some(s => s.status === 'evaluated')
                                                ? `${Math.round(
                                                    submissions
                                                        .filter(s => s.status === 'evaluated')
                                                        .reduce((sum, s) => sum + s.totalScore, 0) /
                                                    submissions.filter(s => s.status === 'evaluated').length
                                                )}%`
                                                : 'N/A'}
                                        </StatNumber>
                                        <StatHelpText mb={0}>For evaluated submissions</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        {submissions.length === 0 ? (
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <Text>No students have submitted this exam yet.</Text>
                            </Alert>
                        ) : (
                            <>
                                <Flex mb={6} wrap="wrap" gap={4} justify={{ base: "center", md: "flex-start" }}>
                                    {/* Evaluate All Pending Submissions button */}
                                    {/* Evaluate All Pending Submissions button */}
                                    {(isEssayExam ||
                                        (examType === 'CodingExam' && exam.type === 'math') ||
                                        (examType === 'CodingExam' && ['coding', 'complex', 'diverse'].includes(exam.type))) &&
                                        pendingSubmissions > 0 && (
                                            <Button
                                                colorScheme="teal"
                                                onClick={onOpen}
                                                leftIcon={<Icon as={FaRocket} />}
                                                size="md"
                                                boxShadow="md"
                                                _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                                transition="all 0.2s"
                                            >
                                                Evaluate All Pending Submissions ({pendingSubmissions})
                                            </Button>
                                        )}

                                    {/* Publish All Results button */}
                                    {isEssayExam && unpublishedSubmissions > 0 && (
                                        <Button
                                            colorScheme="blue"
                                            onClick={onPublishOpen}
                                            leftIcon={<Icon as={FaBullhorn} />}
                                            size="md"
                                            boxShadow="md"
                                            _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                            transition="all 0.2s"
                                        >
                                            Publish All Results ({unpublishedSubmissions})
                                        </Button>
                                    )}

                                    {/* Delete All Submissions button */}
                                    {submissions.length > 0 && (
                                        <Button
                                            colorScheme="red"
                                            onClick={onDeleteOpen}
                                            leftIcon={<Icon as={FaTrash} />}
                                            size="md"
                                            boxShadow="md"
                                            _hover={{ boxShadow: "lg", transform: "translateY(-1px)" }}
                                            transition="all 0.2s"
                                        >
                                            Delete All Submissions
                                        </Button>
                                    )}
                                </Flex>

                                <Box overflowX="auto" boxShadow="sm" borderRadius="md">
                                    <TableContainer>
                                        <Table variant="simple">
                                            <Thead bg={tableHeadBg}>
                                                <Tr>
                                                    <Th>Student</Th>
                                                    <Th>Email</Th>
                                                    <Th>Submitted</Th>
                                                    <Th>Status</Th>
                                                    <Th>Score</Th>
                                                    <Th>Published</Th>
                                                    <Th>Action</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {submissions.map((submission) => (
                                                    <Tr
                                                        key={submission.submissionId}
                                                        _hover={{ bg: hoverBg }}
                                                        transition="background 0.2s"
                                                    >
                                                        <Td fontWeight="medium">{submission.studentName}</Td>
                                                        <Td>{submission.studentEmail}</Td>
                                                        <Td>{formatDate(submission.submittedAt)}</Td>
                                                        <Td>{getStatusBadge(submission.status)}</Td>
                                                        <Td fontWeight="medium" color={submission.status === 'evaluated' ? 'green.500' : 'gray.500'}>
                                                            {submission.status === 'evaluated'
                                                                ? `${submission.totalScore}%`
                                                                : 'Pending'}
                                                        </Td>
                                                        <Td>
                                                            {submission.status === 'evaluated' &&
                                                                getPublishStatusBadge(submission.resultsPublished)}
                                                        </Td>
                                                        <Td>
                                                            <Button
                                                                size="sm"
                                                                colorScheme="blue"
                                                                onClick={() => viewSubmissionDetails(submission.submissionId)}
                                                                leftIcon={<Icon as={FaEye} boxSize={3} />}
                                                                boxShadow="sm"
                                                                _hover={{ boxShadow: "md", transform: "translateY(-1px)" }}
                                                                transition="all 0.2s"
                                                            >
                                                                View
                                                            </Button>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </>
                        )}
                    </CardBody>
                </Card>
            </Container>

            {/* Bulk Evaluation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {examType === 'CodingExam' && exam.type === 'math'
                            ? 'Evaluate All Math Submissions'
                            : examType === 'CodingExam' && ['coding', 'complex', 'diverse'].includes(exam.type)
                                ? 'Evaluate All Coding Submissions'
                                : 'Evaluate All Submissions'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {examType === 'CodingExam' && exam.type === 'math' ? (
                            <Text>
                                This will evaluate all pending math submissions ({pendingSubmissions}) against your reference solutions.
                                The evaluation checks for mathematical equivalence and understanding.
                            </Text>
                        ) : examType === 'CodingExam' && ['coding', 'complex', 'diverse'].includes(exam.type) ? (
                            <Text>
                                This will evaluate all pending coding submissions ({pendingSubmissions}) against your reference solutions.
                                The evaluation checks code correctness, logic, and output against your model solutions.
                            </Text>
                        ) : (
                            <Text>
                                This will evaluate all pending submissions ({pendingSubmissions}) using AI evaluation
                                against your reference solutions. The process may take some time depending on the number
                                of submissions.
                            </Text>
                        )}
                        <Alert status="info" mt={4}>
                            <AlertIcon />
                            <Text>Make sure you have provided reference solutions for the questions.</Text>
                        </Alert>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="gray"
                            mr={3}
                            onClick={onClose}
                            leftIcon={<Icon as={FaTimes} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={handleBulkEvaluation}
                            isLoading={evaluating}
                            loadingText="Evaluating..."
                            leftIcon={<Icon as={FaCheck} />}
                        >
                            Evaluate All
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Publish Results Modal */}
            <Modal isOpen={isPublishOpen} onClose={onPublishClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Publish All Results</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>
                            This will publish evaluation results for all evaluated submissions ({unpublishedSubmissions})
                            that haven't been published yet. Students will be able to see their scores and feedback.
                        </Text>
                        <Alert status="info" mt={4}>
                            <AlertIcon />
                            <Text>
                                Once published, students will have full access to their scores and feedback. This action cannot be undone.
                            </Text>
                        </Alert>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="gray"
                            mr={3}
                            onClick={onPublishClose}
                            leftIcon={<Icon as={FaTimes} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handlePublishAllResults}
                            isLoading={publishing}
                            loadingText="Publishing..."
                            leftIcon={<Icon as={FaBullhorn} />}
                        >
                            Publish All
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Confirm Delete All Submissions</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Alert status="error" borderRadius="md">
                            <AlertIcon />
                            <Text>Are you sure you want to delete ALL submissions for this exam? This action cannot be undone and will remove {submissions.length} submissions.</Text>
                        </Alert>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="gray"
                            mr={3}
                            onClick={onDeleteClose}
                            leftIcon={<Icon as={FaTimes} />}
                        >
                            Cancel
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={handleDeleteAllSubmissions}
                            isLoading={loading && !error}
                            loadingText="Deleting..."
                            leftIcon={<Icon as={FaTrash} />}
                        >
                            Delete All
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ExamSubmissions;