import os
import json
import sys
import time
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

class DeepseekCodeGenerator:
    def __init__(self):
       
        self.model_id = "harisgul031/Deepseek_finetuned_for_Genflex_Coding"  
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.max_retries = 3
        self.model = None
        self.tokenizer = None

    def setup_model(self):
        """Initialize the fine-tuned Deepseek model and tokenizer"""
        try:
            print("Loading model and tokenizer...", file=sys.stderr)
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_id)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                low_cpu_mem_usage=True,
                device_map="auto" if self.device == "cuda" else None
            )
            print(f"Model loaded successfully on {self.device}", file=sys.stderr)
            return True
        except Exception as e:
            print(json.dumps({"error": f"Setup error: {str(e)}"}), file=sys.stderr)
            return False

    def generate_text(self, prompt, max_length=2048, temperature=0.7, top_p=0.9):
        """Generate text using the fine-tuned Deepseek model"""
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=max_length,
                    do_sample=True,
                    temperature=temperature,
                    top_p=top_p,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove the input prompt from the response if it's included
            if response.startswith(prompt):
                response = response[len(prompt):].strip()
            
            return response
        except Exception as e:
            raise Exception(f"Generation error: {str(e)}")

    def generate_questions(self, prompt, num_questions):
        """Generate coding questions based on the given prompt"""
        try:
            if not self.model or not self.tokenizer:
                if not self.setup_model():
                    raise Exception("Failed to initialize model")

            # Same prompt format as in the HuggingChat version
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

            # Try multiple times if necessary
            for attempt in range(self.max_retries):
                try:
                    print(f"Attempt {attempt+1}/{self.max_retries} to generate questions...", file=sys.stderr)
                    response_text = self.generate_text(modified_prompt)
                    if not response_text:
                        raise Exception("Empty response from model")
                    break
                except Exception as e:
                    if attempt == self.max_retries - 1:
                        raise Exception(f"Generation failed after {self.max_retries} attempts: {str(e)}")
                    print(f"Attempt {attempt+1} failed: {str(e)}. Retrying...", file=sys.stderr)
                    time.sleep(2)  # Wait before retry

            # Parse questions and solutions - same parsing logic as in the HuggingChat version
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
                    'question': current_question
                    
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

        generator = DeepseekCodeGenerator()
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