import os
from hugchat import hugchat
from hugchat.login import Login
import json
import sys
import time

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
            if not self.setup_chatbot():
                raise Exception("Failed to initialize chatbot")

            # Keep same prompt
            modified_prompt = (
                f"Generate exactly {num_questions} different complex programming questions about {prompt}. "
                "For each question:\n"
                "1. Start with 'Question X:' where X is the question number\n"
                "2. Include a detailed problem description with:\n"
                "   - Problem requirements\n"
                "   - Input/Output format\n"
                "   - Example cases\n"
                "3. Then 'Solution X:' with complete code solution\n"
                "4. Make each question unique and challenging\n"
                "5. Provide optimized code solutions with comments\n\n"
                "Format exactly as follows:\n"
                "Question 1: [detailed question text]\n"
                "Solution 1: [complete code solution]\n"
                "Question 2: [detailed question text]\n"
                "Solution 2: [complete code solution]\n"
                "And so on..."
            )

            try:
                # Single attempt instead of multiple to reduce time
                response = self.chatbot.chat(modified_prompt)
                response_text = str(response)
                if not response_text:
                    raise Exception("Empty response from chatbot")
            except Exception as e:
                raise Exception(f"Chat error: {str(e)}")

            # Parse questions and solutions
            questions_and_solutions = []
            current_question = None
            current_solution = []
            
            lines = response_text.split('\n')
            i = 0
            while i < len(lines):
                line = lines[i].strip()
                if not line:
                    i += 1
                    continue
                
                if line.lower().startswith('question'):
                    if current_question and current_solution:
                        questions_and_solutions.append({
                            'question': current_question,
                            'solution': '\n'.join(current_solution)
                        })
                    # Remove duplicate numbering
                    question_text = line.split(':', 1)[1].strip() if ':' in line else line
                    question_text = question_text.split('Question')[0].strip() if 'Question' in question_text else question_text
                    current_question = question_text
                    i += 1
                    while i < len(lines) and not lines[i].lower().startswith('solution'):
                        if lines[i].strip():
                            current_question += '\n' + lines[i].strip()
                        i += 1
                    current_solution = []
                elif line.lower().startswith('solution'):
                    solution_text = line.split(':', 1)[1].strip() if ':' in line else line
                    current_solution = [solution_text]
                    i += 1
                    while i < len(lines) and not lines[i].lower().startswith('question'):
                        if lines[i].strip():
                            current_solution.append(lines[i].strip())
                        i += 1
                else:
                    i += 1

            if current_question and current_solution:
                questions_and_solutions.append({
                    'question': current_question,
                    'solution': '\n'.join(current_solution)
                })

            if not questions_and_solutions:
                raise Exception("No questions were generated")

            # Format questions with clean numbering
            formatted_questions = []
            for idx, qa in enumerate(questions_and_solutions[:num_questions], 1):
                formatted_questions.append({
                    'question': f" {qa['question']}",
                    'solution': f"Solution {idx}: {qa['solution'].split(':', 1)[1].strip() if ':' in qa['solution'] else qa['solution']}"
                })

            return formatted_questions

        except Exception as e:
            error_msg = f"Generation error: {str(e)}"
            print(json.dumps({"error": error_msg}), file=sys.stderr)
            raise Exception(error_msg)

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