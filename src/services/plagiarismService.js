import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api/teacher';

// Check plagiarism for all submissions of an exam
export const checkExamPlagiarism = async (examType, examId) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/plagiarism-check/${examType}/${examId}`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error checking exam plagiarism:', error);
        throw error;
    }
};

// Get plagiarism check history for an exam
export const getPlagiarismHistory = async (examType, examId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/plagiarism-history/${examType}/${examId}`,
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting plagiarism history:', error);
        throw error;
    }
};