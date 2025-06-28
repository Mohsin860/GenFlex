import os
from openai import OpenAI
import json
import sys
import time

class MathQuestionGenerator:
    def __init__(self):
        self.api_key = "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"
        self.max_retries = 3
        self.client = None

    def setup_openai_client(self):
        try:
            self.client = OpenAI(api_key=self.api_key)
            return True
        except Exception as e:
            print(json.dumps({"error": f"Setup error: {str(e)}"}), file=sys.stderr)
            return False

    def get_ai_response(self, prompt):
        """Get response from OpenAI GPT"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert mathematics instructor. Generate clear, well-structured math questions with step-by-step solutions. Use plain text format without LaTeX."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API error: {str(e)}", file=sys.stderr)
            raise e

    def generate_questions(self, prompt, num_questions):
        try:
            if not self.setup_openai_client():
                raise Exception("Failed to initialize OpenAI client")

            # Modified prompt to explicitly request questions and solutions
            modified_prompt = (
                f"Generate {num_questions} mathematics questions about {prompt} in plain text and mathematical format and use math notations and signs where required dont include latex format in it. "
                "For each question, provide its solution in mathematical format. "
                "Format as follows:\n"
                "Question 1: [question text]\n"
                "Solution 1: [step by step solution]\n"
                "Repeat for each question. Don't include latex or mathematical symbols."
            )

            try:
                response_text = self.get_ai_response(modified_prompt)
                if not response_text:
                    raise Exception("Empty response from OpenAI")
            except Exception as e:
                raise Exception(f"API error: {str(e)}")

            # Parse questions and solutions
            questions_and_solutions = []
            lines = response_text.split('\n')
            current_question = None
            current_solution = []

            for line in lines:
                line = line.strip()
                if not line:
                    continue

                if line.lower().startswith('question'):
                    if current_question and current_solution:
                        questions_and_solutions.append({
                            'question': current_question,
                            'solution': '\n'.join(current_solution)
                        })
                    current_question = line
                    current_solution = []
                elif line.lower().startswith('solution'):
                    current_solution = [line]
                elif current_solution is not None and current_question:
                    current_solution.append(line)

            # Add the last question-solution pair
            if current_question and current_solution:
                questions_and_solutions.append({
                    'question': current_question,
                    'solution': '\n'.join(current_solution)
                })

            # Validate results
            if not questions_and_solutions:
                raise Exception("No questions were generated")

            # Format questions and solutions
            formatted_results = []
            for i, item in enumerate(questions_and_solutions[:num_questions], 1):
                formatted_results.append({
                    'question': f" \n{item['question'].split(':', 1)[1].strip()}",
                    'solution': f"Solution {i}:\n{item['solution'].split(':', 1)[1].strip() if ':' in item['solution'] else item['solution']}"
                })

            return formatted_results

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

        generator = MathQuestionGenerator()
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