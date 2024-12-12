# questionGenerator.py
import os
import logging

# Configure environment variables to suppress warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# Configure logging to suppress warnings
logging.getLogger('tensorflow').setLevel(logging.ERROR)
logging.getLogger('transformers').setLevel(logging.ERROR)
logging.getLogger('keras').setLevel(logging.ERROR)

# Import tensorflow first to apply warning suppression
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from transformers import pipeline, AutoTokenizer
from keybert import KeyBERT
import PyPDF2
import warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore')

class QuestionGenerator:
    def __init__(self):
        self.model_name = "ZhangCheng/T5-Base-Fine-Tuned-for-Question-Generation"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.pipe = pipeline("text2text-generation", 
                           model=self.model_name,
                           max_length=512)
        self.kw_model = KeyBERT()
        self.max_tokens = 300  # Reduced token limit for safety

    def truncate_to_max_tokens(self, text):
        """Truncate text to maximum token length"""
        tokens = self.tokenizer.encode(text)
        if len(tokens) > self.max_tokens:
            tokens = tokens[:self.max_tokens]
            text = self.tokenizer.decode(tokens, skip_special_tokens=True)
        return text

    def extract_text_from_pdf(self, pdf_path):
        """Extract text content from PDF file"""
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + " "
        except Exception as e:
            raise Exception(f"Error reading PDF: {e}")
        return text.strip()

    def split_text_into_chunks(self, text):
        """Split text into chunks respecting token limits"""
        words = text.split()
        chunks = []
        current_chunk = []
        
        for word in words:
            current_chunk.append(word)
            current_text = " ".join(current_chunk)
            
            # Check token length before adding more words
            if len(self.tokenizer.encode(current_text)) >= self.max_tokens:
                chunks.append(" ".join(current_chunk[:-1]))  # Exclude last word
                current_chunk = [word]  # Start new chunk with last word
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks

    def extract_unique_keywords(self, context, num_keywords=5, existing_keywords=set()):
        """Extract unique keywords from context"""
        context = self.truncate_to_max_tokens(context)
        try:
            keywords = self.kw_model.extract_keywords(
                context, 
                keyphrase_ngram_range=(1, 2), 
                stop_words='english', 
                top_n=num_keywords
            )
            unique_keywords = [kw[0] for kw in keywords if kw[0] not in existing_keywords]
            existing_keywords.update(unique_keywords)
            return unique_keywords
        except Exception as e:
            print(f"Error extracting keywords: {str(e)}")
            return []

    def generate_diverse_questions(self, answer, context, num_questions=1):
        """Generate diverse questions for given answer and context"""
        # Ensure context + answer combination doesn't exceed token limit
        context = self.truncate_to_max_tokens(context)
        input_text = f"<answer> {answer} <context> {context}"
        
        try:
            outputs = self.pipe(
                input_text, 
                max_length=150, 
                num_return_sequences=num_questions,
                do_sample=True, 
                top_k=50, 
                top_p=0.95,
                temperature=0.7  # Added for more diverse questions
            )
            questions = []
            for output in outputs:
                question = output['generated_text'].strip()
                if question:  # Only add non-empty questions
                    questions.append({
                        'question': question,
                        'answer': answer,
                        'context': context
                    })
            return questions
        except Exception as e:
            print(f"Error generating question for answer '{answer}': {str(e)}")
            return []

    def generate_questions_from_pdf(self, pdf_path, num_questions=20):
        """Generate questions from PDF content"""
        try:
            # Extract and validate text
            context = self.extract_text_from_pdf(pdf_path)
            if not context.strip():
                raise Exception("The PDF file appears to be empty or unreadable.")
            
            # Process text in chunks
            context_chunks = self.split_text_into_chunks(context)
            existing_keywords = set()
            questions = []
            
            # Generate questions from each chunk
            for chunk in context_chunks:
                if len(questions) >= num_questions:
                    break
                
                # Extract keywords and generate questions
                answers = self.extract_unique_keywords(
                    chunk, 
                    num_keywords=min(3, num_questions - len(questions)),
                    existing_keywords=existing_keywords
                )
                
                for answer in answers:
                    if len(questions) >= num_questions:
                        break
                    new_questions = self.generate_diverse_questions(
                        answer,
                        chunk,
                        num_questions=1
                    )
                    questions.extend(new_questions)
            
            # Ensure we don't exceed requested number of questions
            final_questions = questions[:num_questions]
            
            # Validate generated questions
            if not final_questions:
                raise Exception("No valid questions could be generated from the PDF content.")
            
            return final_questions

        except Exception as e:
            raise Exception(f"An error occurred during question generation: {str(e)}")

# Create singleton instance
question_generator = QuestionGenerator()