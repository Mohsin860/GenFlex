import os
from hugchat import hugchat
from hugchat.login import Login
import json
import sys
import time
import re

class DiverseCodeGenerator:
    def __init__(self):
        self.email = "harisgul031@gmail.com"
        self.password = "HcestLavie123@@"
        self.cookie_path = os.path.join(os.path.dirname(__file__), 'cookies')
        self.max_retries = 3

    def setup_chatbot(self):
        try:
            os.makedirs(self.cookie_path, exist_ok=True)
            sign = Login(self.email, self.password)
            cookies = sign.login(cookie_dir_path=self.cookie_path, save_cookies=True)
            self.chatbot = hugchat.ChatBot(cookies=cookies.get_dict())
            self.chatbot.new_conversation()
            return True
        except Exception as e:
            print(json.dumps({"error": f"Setup error: {str(e)}"}), file=sys.stderr)
            return False

    def generate_questions(self, prompt, num_questions):
        try:
            # Cap the maximum questions
            num_questions = min(int(num_questions), 15)
            
            if not self.setup_chatbot():
                raise Exception("Failed to initialize chatbot")
            
            # First try batch generation (faster if it works)
            batch_questions = self.generate_batch_questions(prompt, num_questions)
            
            # If we got the correct number, return them
            if len(batch_questions) == num_questions:
                return batch_questions
                
            # Otherwise fall back to the slower but more reliable method
            print(f"Batch generation produced {len(batch_questions)} questions instead of {num_questions}. Falling back to individual generation.", file=sys.stderr)
            return self.generate_individual_questions(prompt, num_questions)
            
        except Exception as e:
            error_msg = f"Generation error: {str(e)}"
            print(json.dumps({"error": error_msg}), file=sys.stderr)
            raise Exception(error_msg)

    def generate_batch_questions(self, prompt, num_questions):
        """Try to generate all questions in one batch (faster)"""
        try:
            # Use a very explicit format to increase chances of success
            batch_prompt = (
                f"Generate EXACTLY {num_questions} diverse programming questions about {prompt}.\n\n"
                "For each question, follow this EXACT format:\n\n"
                "QUESTION_START\n"
                "Question N: [detailed problem description]\n"
                "[include requirements, input/output format, and examples]\n"
                "QUESTION_END\n\n"
                "SOLUTION_START\n"
                "Solution N: [complete code solution with comments]\n"
                "SOLUTION_END\n\n"
                f"Make sure to generate EXACTLY {num_questions} questions with this format, numbering from 1 to {num_questions}."
            )
            
            response = self.chatbot.chat(batch_prompt)
            response_text = str(response)
            
            # Use regex to extract questions and solutions with special markers
            question_blocks = re.findall(r'QUESTION_START\n(Question \d+:.*?)\nQUESTION_END', response_text, re.DOTALL)
            solution_blocks = re.findall(r'SOLUTION_START\n(Solution \d+:.*?)\nSOLUTION_END', response_text, re.DOTALL)
            
            # If the special markers didn't work, try a more lenient approach
            if len(question_blocks) != num_questions or len(solution_blocks) != num_questions:
                # Try standard parsing
                question_blocks = re.findall(r'Question (\d+):(.*?)(?=Question \d+:|Solution \d+:|$)', response_text, re.DOTALL)
                solution_blocks = re.findall(r'Solution (\d+):(.*?)(?=Question \d+:|Solution \d+:|$)', response_text, re.DOTALL)
                
                # Reformat the matches if found
                if question_blocks and solution_blocks:
                    question_blocks = [f"Question {q[0]}:{q[1]}" for q in question_blocks]
                    solution_blocks = [f"Solution {s[0]}:{s[1]}" for s in solution_blocks]
            
            # Final check - do we have matching pairs?
            if len(question_blocks) == num_questions and len(solution_blocks) == num_questions:
                questions = []
                for i in range(num_questions):
                    questions.append({
                        'question': question_blocks[i].strip(),
                        'solution': solution_blocks[i].strip()
                    })
                return questions
            
            # If we have more than we need, truncate
            if len(question_blocks) >= num_questions and len(solution_blocks) >= num_questions:
                questions = []
                for i in range(num_questions):
                    questions.append({
                        'question': question_blocks[i].strip(),
                        'solution': solution_blocks[i].strip()
                    })
                return questions
                
            # If we didn't get what we needed, return what we have
            return []
            
        except Exception as e:
            print(f"Batch generation failed: {str(e)}", file=sys.stderr)
            return []

    def generate_individual_questions(self, prompt, num_questions):
        """Generate questions one at a time (more reliable but slower)"""
        all_questions = []
        
        for i in range(1, num_questions + 1):
            single_question_prompt = (
                f"Generate ONE complex programming question (#{i}) about {prompt}.\n\n"
                "Format exactly as follows:\n"
                "Question: [detailed problem description with requirements, input/output format, and examples]\n\n"
                "Solution: [complete code solution with comments]\n\n"
                "Ensure the question is challenging and the solution is well-commented."
            )
            
            try:
                response = self.chatbot.chat(single_question_prompt)
                response_text = str(response)
                
                # Extract question and solution
                question_match = re.search(r'Question:?\s*(.*?)(?=Solution:|$)', response_text, re.DOTALL)
                solution_match = re.search(r'Solution:?\s*(.*)', response_text, re.DOTALL)
                
                if question_match and solution_match:
                    question_text = question_match.group(1).strip()
                    solution_text = solution_match.group(1).strip()
                    
                    if question_text and solution_text:
                        all_questions.append({
                            'question': question_text,
                            'solution': f"Solution {i}: {solution_text}"
                        })
                        continue
            
            except Exception as e:
                print(f"Generation for question {i} failed: {str(e)}", file=sys.stderr)
            
            # If we get here, creation failed - add placeholder
            all_questions.append({
                'question': f"Question about {prompt}. (You can edit this question)",
                'solution': f"Solution {i}: // Add your reference solution here"
            })
        
        return all_questions

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            raise Exception("Missing parameters. Usage: script.py <prompt> <num_questions>")

        prompt = sys.argv[1]
        try:
            num_questions = int(sys.argv[2])
            if num_questions < 1:
                raise ValueError("Number of questions must be positive")
        except ValueError as e:
            raise Exception(f"Invalid number of questions: {str(e)}")

        generator = DiverseCodeGenerator()
        questions = generator.generate_questions(prompt, num_questions)

        print(json.dumps({
            "success": True,
            "questions": questions
        }))

    except Exception as e:
        error_msg = str(e)
        print(json.dumps({
            "success": False,
            "error": error_msg
        }))
        sys.exit(1)