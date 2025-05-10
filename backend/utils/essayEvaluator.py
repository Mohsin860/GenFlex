#!/usr/bin/env python3
import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer, util
import spacy
import traceback

# Load pre-trained model for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load spaCy model for POS tagging
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If the model is not installed, provide informative error
    print(json.dumps({
        "error": "SpaCy model 'en_core_web_sm' not found. Please install it with 'python -m spacy download en_core_web_sm'"
    }))
    sys.exit(1)

def extract_key_concepts(text):
    """
    Extract key concepts from the text using POS tagging.
    """
    doc = nlp(text)
    key_concepts = [token.text.lower() for token in doc if token.pos_ in ["NOUN", "VERB", "ADJ"]]
    return list(set(key_concepts))  # Remove duplicates

def evaluate_answer(reference_answer, student_answer):
    """
    Enhanced evaluation using:
    - Semantic similarity with sentence transformers
    - Conceptual keyword matching
    - Score normalization
    
    Returns score between 0 and 1
    """
    # Handle empty answers
    if not student_answer or not reference_answer:
        return 0.0
    
    try:
        # Encode both sentences
        ref_embedding = model.encode(reference_answer, convert_to_tensor=True)
        student_embedding = model.encode(student_answer, convert_to_tensor=True)

        # Calculate cosine similarity
        semantic_score = util.pytorch_cos_sim(ref_embedding, student_embedding).item()

        # Dynamically extract key concepts from the reference answer
        key_concepts = extract_key_concepts(reference_answer)
        
        if not key_concepts:  # If no key concepts were found
            return max(0, min(semantic_score, 1))

        # Calculate keyword relevance score
        student_words = set(student_answer.lower().split())
        keyword_matches = sum(1 for word in key_concepts if word in student_words)
        keyword_score = keyword_matches / len(key_concepts) if key_concepts else 0

        # Combine scores with weighted average
        combined_score = (0.7 * semantic_score) + (0.3 * keyword_score)

        # Normalize score to account for model's typical output range
        normalized_score = np.interp(combined_score, [0.2, 0.9], [0, 1])  # Adjust based on observed ranges

        return max(0, min(normalized_score, 1))
    
    except Exception as e:
        # Log the error but return a default score instead of crashing
        print(f"Error during evaluation: {str(e)}", file=sys.stderr)
        return 0.0

def generate_feedback(score, reference_answer, student_answer):
    """
    Generate feedback based on the score and comparison of answers.
    """
    if score >= 0.8:
        return "Excellent answer! Your response demonstrates a solid understanding of the concept."
    elif score >= 0.6:
        # Extract missing concepts
        ref_concepts = set(extract_key_concepts(reference_answer))
        student_concepts = set(extract_key_concepts(student_answer))
        missing_concepts = ref_concepts - student_concepts
        
        if missing_concepts:
            missing_list = ", ".join(list(missing_concepts)[:3])  # Limit to first 3
            return f"Good answer, but you could have included more about: {missing_list}."
        else:
            return "Good answer! Consider elaborating more for a perfect score."
    elif score >= 0.4:
        return "Your answer covers some key points but misses important concepts. Review the material and try to be more specific."
    else:
        return "Your answer needs improvement. Please review the topic and provide a more comprehensive response."

def evaluate_submissions(data):
    """
    Evaluate a list of submissions against reference answers.
    
    Expected input format:
    {
        "submissions": [
            {
                "questionId": "123",
                "answer": "Student's answer text",
                "referenceAnswer": "Teacher's reference answer"
            },
            ...
        ]
    }
    
    Returns:
    {
        "results": [
            {
                "questionId": "123",
                "score": 0.85,
                "feedback": "Feedback text"
            },
            ...
        ]
    }
    """
    try:
        results = []
        
        for submission in data.get("submissions", []):
            question_id = submission.get("questionId")
            student_answer = submission.get("answer", "")
            reference_answer = submission.get("referenceAnswer", "")
            
            # Calculate score
            score = evaluate_answer(reference_answer, student_answer)
            
            # Generate feedback
            feedback = generate_feedback(score, reference_answer, student_answer)
            
            # Scale to 0-100 range and round to 1 decimal place
            percentage_score = round(score * 100, 1)
            
            results.append({
                "questionId": question_id,
                "score": percentage_score,
                "feedback": feedback
            })
        
        return {"success": True, "results": results}
    
    except Exception as e:
        traceback_str = traceback.format_exc()
        error_message = f"Error in evaluation: {str(e)}\n{traceback_str}"
        return {"success": False, "error": error_message}

if __name__ == "__main__":
    try:
        # Read JSON input from stdin
        input_json = json.loads(sys.stdin.read())
        
        # Process the evaluation
        result = evaluate_submissions(input_json)
        
        # Return the result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        traceback_str = traceback.format_exc()
        error_message = f"Error processing request: {str(e)}\n{traceback_str}"
        print(json.dumps({"success": False, "error": error_message}))
        sys.exit(1)