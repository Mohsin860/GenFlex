import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json
import sys
import re

class CodingQuestionGenerator:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        self.ensure_data_directory()
        self.load_resources()

    def ensure_data_directory(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def load_resources(self):
        try:
            self.df = pd.read_csv(os.path.join(self.data_dir, 'dataset.csv'))
            self.prompt_embeddings = np.load(os.path.join(self.data_dir, 'prompt_embeddings.npy'))
            dimension = self.prompt_embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index = faiss.read_index(os.path.join(self.data_dir, 'faiss_index.bin'))
        except Exception as e:
            print(json.dumps({"error": f"Failed to load resources: {str(e)}"}))
            sys.exit(1)

    def extract_code_question(self, text):
        # Remove any non-ASCII characters
        text = re.sub(r'[^\x00-\x7F]+', '', text)
        
        # Remove code blocks and their content
        text = re.sub(r'```[^`]*```', '', text)
        
        # Remove testing instructions if they exist
        text = re.sub(r'Test your.*?function.*?\n', '', text)
        
        # Extract the actual programming task
        if "Problem:" in text:
            text = text.split("Problem:")[1]
        
        # Clean up various markers
        markers_to_remove = [
            'Solution:', 'Example:', 'Implementation:', 
            'Note:', 'Here\'s a solution:', 'Output:'
        ]
        for marker in markers_to_remove:
            text = text.replace(marker, '')
        
        # Clean extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Add proper formatting for bullet points
        text = text.replace('*', '\n•')
        
        return text

    def extract_code_solution(self, text):
        # Find code blocks
        code_blocks = re.findall(r'```python(.*?)```', text, re.DOTALL)
        if code_blocks:
            # Return the first code block found
            return code_blocks[0].strip()
        
        # If no code blocks, look for code-like content
        lines = text.split('\n')
        code_lines = []
        for line in lines:
            if any(keyword in line for keyword in ['def ', 'class ', 'return', 'if ', 'for ', 'while ']):
                code_lines.append(line)
            elif line.strip().startswith('#'):  # Comments
                code_lines.append(line)
            elif '    ' in line:  # Indented lines
                code_lines.append(line)
        
        if code_lines:
            return '\n'.join(code_lines)
        
        return ''  # Return empty string if no code found

    def retrieve_similar_questions(self, query, num_questions=5):
        try:
            # Ensure number of questions is within limits
            num_questions = min(max(1, int(num_questions)), 15)
            
            query_embedding = self.model.encode([query])
            distances, indices = self.index.search(np.array(query_embedding), num_questions * 2)
            
            used_questions = set()
            results = []
            
            for idx in indices.flatten():
                if len(results) >= num_questions:
                    break
                    
                raw_question = self.df['prompt'].iloc[idx]
                raw_solution = self.df['response'].iloc[idx]
                
                # Only process if it looks like a coding question
                if 'def ' in raw_question or 'function' in raw_question.lower():
                    question = self.extract_code_question(raw_question)
                    solution = self.extract_code_solution(raw_solution)
                    
                    # Only add if we got both question and solution
                    if question and solution and question not in used_questions:
                        results.append({
                            'question': question,
                            'solution': solution
                        })
                        used_questions.add(question)
            
            return results[:num_questions]  # Ensure we return exactly the requested number
            
        except Exception as e:
            print(json.dumps({"error": f"Error retrieving questions: {str(e)}"}))
            sys.exit(1)

if __name__ == "__main__":
    try:
        if len(sys.argv) < 3:
            print(json.dumps({
                "error": "Missing required parameters. Usage: script.py <prompt> <num_questions>"
            }))
            sys.exit(1)

        generator = CodingQuestionGenerator()
        prompt = sys.argv[1]
        num_questions = int(sys.argv[2])
        
        questions = generator.retrieve_similar_questions(prompt, num_questions)
        
        print(json.dumps({
            "success": True,
            "questions": questions
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)