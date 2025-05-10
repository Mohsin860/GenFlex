//import React, { useState } from 'react';
//import { Box, Button, FormControl, FormLabel, VStack, Heading, Radio, RadioGroup } from '@chakra-ui/react';

 const TakeExam = () => {
   //const [answers, setAnswers] = useState({});

//   // Mock exam data
//   const exam = {
//     title: "Sample Exam",
//     questions: [
//       { id: 1, text: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"] },
//       { id: 2, text: "What is 2 + 2?", options: ["3", "4", "5", "6"] },
//     ]
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log(answers);
//     // Here you would typically send this data to your backend for grading
//   };

//   return (
//     <Box maxWidth="600px" margin="auto" mt={8}>
//       <VStack spacing={4} as="form" onSubmit={handleSubmit}>
//         <Heading>{exam.title}</Heading>
//         {exam.questions.map((question) => (
//           <FormControl key={question.id} isRequired>
//             <FormLabel>{question.text}</FormLabel>
//             <RadioGroup onChange={(value) => setAnswers({...answers, [question.id]: value})}>
//               <VStack align="start">
//                 {question.options.map((option, index) => (
//                   <Radio key={index} value={option}>{option}</Radio>
//                 ))}
//               </VStack>
//             </RadioGroup>
//           </FormControl>
//         ))}
//         <Button type="submit" colorScheme="teal" width="full">
//           Submit Exam
//         </Button>
//       </VStack>
//     </Box>
//   );
};

export default TakeExam;