// In your studentExamService.js, modify it to include the auth token:
import axios from 'axios';

const API_URL = '/api/student/exams';

// Create axios instance with auth header
const createAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      Authorization: user && user.token ? `Bearer ${user.token}` : '',
    },
  };
};

// Get all available exams
export const getAvailableExams = async () => {
  const response = await axios.get(`${API_URL}/available`, createAuthHeader());
  return response.data;
};

// Get exam details by ID and type
export const getExamById = async (examId, examType) => {
  const response = await axios.get(
    `${API_URL}/details/${examType}/${examId}`, 
    createAuthHeader()
  );
  return response.data;
};

// Submit exam attempt
export const submitExamAttempt = async (examData) => {
  const response = await axios.post(
    `${API_URL}/submit`, 
    examData, 
    createAuthHeader()
  );
  return response.data;
};

// Get exam results by attempt ID
export const getExamResults = async (attemptId) => {
    const response = await axios.get(
      `${API_URL}/results/${attemptId}`, 
      createAuthHeader()
    );
    return response.data;
  };

// Get all attempts for current student
export const getStudentAttempts = async () => {
  const response = await axios.get(
    `${API_URL}/attempts`, 
    createAuthHeader()
  );
  return response.data;
};