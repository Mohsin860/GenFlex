const express = require('express');
const router = express.Router();

router.get('/count', async (req, res) => {
  try {
    // Count both regular and coding exams
    const totalExams = await Exam.countDocuments() + await CodingExam.countDocuments();
    res.json({ count: totalExams });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;