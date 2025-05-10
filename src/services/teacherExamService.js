import axios from 'axios';

const API_URL = '/api/teacher';

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

// Get all exams created by teacher
export const getTeacherExams = async () => {
  const response = await axios.get(`${API_URL}/exams`, createAuthHeader());
  return response.data;
};

// Publish or unpublish an exam
export const toggleExamPublish = async (examId, examType, publish) => {
  const response = await axios.post(
    `${API_URL}/toggle-publish`,
    { examId, examType, publish },
    createAuthHeader()
  );
  return response.data;
};

// Get exam for solution editor
export const getExamForSolution = async (examType, examId) => {
  const response = await axios.get(
    `${API_URL}/exam-solution/${examType}/${examId}`, 
    createAuthHeader()
  );
  return response.data;
};

// Save teacher solutions
export const saveTeacherSolutions = async (examId, examType, solutions) => {
  const response = await axios.post(
    `${API_URL}/save-solutions`,
    { examId, examType, solutions },
    createAuthHeader()
  );
  return response.data;
};



// Get student submissions for an exam
export const getExamSubmissions = async (examType, examId) => {
    const response = await axios.get(
      `${API_URL}/exam-submissions/${examType}/${examId}`, 
      createAuthHeader()
    );
    return response.data;
  };
  
  // Get details of a specific submission
  export const getSubmissionDetails = async (submissionId) => {
    const response = await axios.get(
      `${API_URL}/submission/${submissionId}`, 
      createAuthHeader()
    );
    return response.data;
  };

  // Publish results for a single submission
export const publishSubmissionResults = async (submissionId) => {
    const response = await axios.post(
      `${API_URL}/publish-results/${submissionId}`,
      {},
      createAuthHeader()
    );
    return response.data;
  };
  
  // Publish all results for an exam
  export const publishAllResults = async (examType, examId) => {
    const response = await axios.post(
      `${API_URL}/publish-all-results/${examType}/${examId}`,
      {},
      createAuthHeader()
    );
    return response.data;
  };

  // Delete a specific submission
export const deleteSubmission = async (submissionId) => {
    const response = await axios.delete(
      `${API_URL}/submission/${submissionId}`,
      createAuthHeader()
    );
    return response.data;
  };
  
  // Delete all submissions for an exam
  export const deleteAllSubmissions = async (examType, examId) => {
    const response = await axios.delete(
      `${API_URL}/submissions/${examType}/${examId}`,
      createAuthHeader()
    );
    return response.data;
  };

  // Update evaluation
export const updateEvaluation = async (submissionId, evaluationData) => {
    const response = await axios.put(
      `${API_URL}/evaluation/${submissionId}`,
      evaluationData,
      createAuthHeader()
    );
    return response.data;
  };