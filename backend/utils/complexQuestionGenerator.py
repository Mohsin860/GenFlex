import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json
import sys
import re

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
class ComplexQuestionGenerator:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data1')
        self.ensure_data_directory()
        self.load_resources()

    def ensure_data_directory(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def load_resources(self):
        try:
            self.df = pd.read_excel(os.path.join(self.data_dir, 'data_merged_dataset.xlsx'), engine="openpyxl")
            self.combined_embeddings = np.load(os.path.join(self.data_dir, 'combined_embeddings.npy'))
            dimension = self.combined_embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dimension)
            self.index = faiss.read_index(os.path.join(self.data_dir, 'faiss_index.bin'))
        except Exception as e:
            print(json.dumps({"error": f"Failed to load resources: {str(e)}"}))
            sys.exit(1)

    def clean_description(self, text):
        text = re.sub(r'[^\x00-\x7F]+', '', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('[TAG:', '\nTags:')
        return text.strip()

    def retrieve_similar_questions(self, query, num_questions=5):
        try:
            num_questions = min(max(1, int(num_questions)), 15)
            query_embedding = self.model.encode([query])
            distances, indices = self.index.search(np.array(query_embedding), num_questions * 2)
            
            questions = []
            used_descriptions = set()
            
            for idx in indices.flatten():
                if len(questions) >= num_questions:
                    break
                    
                description = self.df['description'].iloc[idx]
                solution = self.df['solution'].iloc[idx] if 'solution' in self.df.columns else ''
                
                cleaned_description = self.clean_description(str(description))
                if cleaned_description and cleaned_description not in used_descriptions:
                    questions.append({
                        'question': cleaned_description,
                        'solution': str(solution)
                    })
                    used_descriptions.add(cleaned_description)
            
            return questions[:num_questions]
            
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

        generator = ComplexQuestionGenerator()
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