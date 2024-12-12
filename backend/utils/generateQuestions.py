# generateQuestions.py
import sys
import json
import os
from questionGenerator import question_generator
import traceback

def main():
    try:
        if len(sys.argv) < 2:
            raise Exception("Please provide PDF file path")
        
        pdf_path = sys.argv[1]
        num_questions = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        
        if not os.path.exists(pdf_path):
            raise Exception(f"PDF file not found: {pdf_path}")
        
        # Generate questions
        questions = question_generator.generate_questions_from_pdf(pdf_path, num_questions)
        
        if not questions:
            raise Exception("No questions could be generated")
        
        # Print only the JSON output
        print(json.dumps(questions))
        sys.stdout.flush()
        
    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(error_message, file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()