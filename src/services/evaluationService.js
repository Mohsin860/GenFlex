import axios from 'axios';

const API_URL = '/api/evaluation';

// Create axios instance with auth header
const createAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': user && user.token ? `Bearer ${user.token}` : '',
    },
  };
};

// Evaluate a single essay exam submission
export const evaluateEssaySubmission = async (submissionId) => {
  const response = await axios.post(
    `${API_URL}/essay-exam/${submissionId}`,
    {},
    createAuthHeader()
  );
  return response.data;
};

// Bulk evaluate all essay submissions for an exam
export const evaluateAllSubmissions = async (examType, examId) => {
  const response = await axios.post(
    `${API_URL}/bulk/${examType}/${examId}`,
    {},
    createAuthHeader()
  );
  return response.data;
};

// Evaluate a single math exam submission
export const evaluateMathSubmission = async (submissionId) => {
  const response = await axios.post(
    `${API_URL}/math-exam/${submissionId}`,
    {},
    createAuthHeader()
  );
  return response.data;
};

// Bulk evaluate all math submissions for an exam
export const evaluateAllMathSubmissions = async (examId) => {
  const response = await axios.post(
    `${API_URL}/math-bulk/${examId}`,
    {},
    createAuthHeader()
  );
  return response.data;
};

// Evaluate a single coding exam submission
export const evaluateCodingSubmission = async (submissionId) => {
  const response = await axios.post(
    `${API_URL}/coding-exam/${submissionId}`,
    {},
    createAuthHeader()
  );
  return response.data;
};

// Bulk evaluate all coding submissions for an exam
export const evaluateAllCodingSubmissions = async (examId) => {
  const response = await axios.post(
    `${API_URL}/coding-bulk/${examId}`,
    {},
    createAuthHeader()
  );
  return response.data;
};