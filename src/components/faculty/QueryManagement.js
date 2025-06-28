import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Heading,
    VStack,
    Card,
    CardBody,
    CardHeader,
    Text,
    Spinner,
    Button,
    Badge,
    HStack,
    Alert,
    AlertIcon,
    Textarea,
    Flex,
    useColorModeValue,
    Divider,
    SimpleGrid
} from '@chakra-ui/react';
import { getQueriesByTeacher, respondToQuery } from '../../services/teacherExamService';
import { FaReply, FaCheck } from 'react-icons/fa';

const QueryManagement = () => {
    const { examType, examId } = useParams();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [submitting, setSubmitting] = useState({});

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const response = await getQueriesByTeacher(examId, examType);
            setQueries(response.queries);
        } catch (error) {
            console.error('Error fetching queries:', error);
            setError('Failed to load queries');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (queryId, value) => {
        setResponses(prev => ({
            ...prev,
            [queryId]: value
        }));
    };

    const handleSubmitResponse = async (queryId) => {
        try {
            setSubmitting(prev => ({ ...prev, [queryId]: true }));
            await respondToQuery(queryId, {
                response: responses[queryId],
                status: 'resolved'
            });
            
            fetchQueries();
        } catch (error) {
            console.error('Error responding to query:', error);
        } finally {
            setSubmitting(prev => ({ ...prev, [queryId]: false }));
        }
    };

    useEffect(() => {
        fetchQueries();
    }, [examId, examType]);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Heading size="lg" mb={6}>Student Queries</Heading>
            
            {queries.length === 0 ? (
                <Text>No queries found for this exam.</Text>
            ) : (
                <VStack spacing={4} align="stretch">
                    {queries.map(query => (
                        <Card key={query._id} variant="outline">
                            <CardHeader>
                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold">Question ID: {query.questionId}</Text>
                                        <Text fontSize="sm">From: {query.student?.name}</Text>
                                    </Box>
                                    <Box textAlign="right">
                                        <Badge 
                                            colorScheme={query.status === 'resolved' ? 'green' : 'orange'}
                                            fontSize="sm"
                                        >
                                            {query.status}
                                        </Badge>
                                        <Text fontSize="sm">
                                            {new Date(query.createdAt).toLocaleString()}
                                        </Text>
                                    </Box>
                                </SimpleGrid>
                            </CardHeader>
                            <CardBody>
                                <Text mb={4} whiteSpace="pre-wrap">{query.message}</Text>
                                
                                {query.response ? (
                                    <>
                                        <Divider my={2} />
                                        <Text fontWeight="bold">Your Response:</Text>
                                        <Text whiteSpace="pre-wrap">{query.response}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Textarea
                                            value={responses[query._id] || ''}
                                            onChange={(e) => handleResponseChange(query._id, e.target.value)}
                                            placeholder="Enter your response..."
                                            mb={2}
                                        />
                                        <Flex justify="flex-end">
                                            <Button
                                                colorScheme="blue"
                                                size="sm"
                                                leftIcon={<FaReply />}
                                                isLoading={submitting[query._id]}
                                                onClick={() => handleSubmitResponse(query._id)}
                                            >
                                                Respond
                                            </Button>
                                        </Flex>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default QueryManagement;