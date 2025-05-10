#!/usr/bin/env python3
import sys
import json
import traceback
import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import re

# Model settings
MODEL_ID = "codewithdark/deepmath-7b-l"

def setup_model():
    """Initialize the DeepMath model and tokenizer"""
    try:
        print(f"Loading model {MODEL_ID}...", file=sys.stderr)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}", file=sys.stderr)
        
        # Load the tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        
        # Load the model with appropriate settings
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            device_map="auto" if device == "cuda" else None,
            low_cpu_mem_usage=True
        )
        
        print("Model loaded successfully", file=sys.stderr)
        return model, tokenizer, device
    except Exception as e:
        print(f"Error setting up model: {str(e)}", file=sys.stderr)
        return None, None, None

def generate_response(model, tokenizer, device, prompt, max_length=1024):
    """Generate a response from the model"""
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=max_length,
                do_sample=False,  # Use greedy decoding for deterministic outputs
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Remove the prompt from the response if it's included
        if response.startswith(prompt):
            response = response[len(prompt):].strip()
            
        return response
    except Exception as e:
        print(f"Error generating response: {str(e)}", file=sys.stderr)
        return f"Error generating response: {str(e)}"

def extract_json_from_text(text):
    """Extract JSON object from model response text"""
    try:
        # Find potential JSON objects
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1
        
        if start_idx == -1 or end_idx == 0:
            # No JSON object found, try to create one from text
            if "score" in text.lower():
                # Try to extract score using regex
                score_match = re.search(r'score[:\s]*([0-9.]+)', text.lower())
                if score_match:
                    score = float(score_match.group(1))
                    score = max(0, min(100, score))
                    return {"score": score}
            return None
            
        json_str = text[start_idx:end_idx]
        try:
            return json.loads(json_str)
        except:
            # Try cleaning the JSON string
            cleaned_json_str = re.sub(r'([{,])\s*([a-zA-Z0-9_]+)\s*:', r'\1"\2":', json_str)
            return json.loads(cleaned_json_str)
    except Exception as e:
        print(f"Error extracting JSON: {str(e)}", file=sys.stderr)
        return None

def evaluate_math_answer(model, tokenizer, device, question, student_answer, reference_answer):
    """
    Use DeepMath model to evaluate a math answer
    
    Returns a dict with score and feedback
    """
    try:
        if not model or not tokenizer:
            return {
                "score": 0, 
                "feedback": "Error setting up evaluation system. Please try again later."
            }
        
             # Construct prompt for the evaluation
        evaluation_prompt = f"""
        Evaluate the student's solution for the following math question.

        **Question:** {question}

        **Student's Answer:**  
        {student_answer}

        **Reference Correct Answer:** {reference_answer}

        ### **Instructions for Evaluation:** 
        1. Just check that the final asnwer of student matches with teacher solution (reference) and give marks accirdingly from 0 to 100
        2. give general 1 line feedback.

        **Response Format - Provide ONLY a JSON object with these fields:**  
        {{
            "score": [Rating between 0-100],
             "feedback" : [feedback about the student solution wrt refernce solution]
        }}
        """

        # Get AI feedback
        response_text = generate_response(model, tokenizer, device, evaluation_prompt)
        
        # Extract JSON from response
        evaluation = extract_json_from_text(response_text)
        
        if not evaluation:
            # Basic evaluation if extraction fails
            is_match = reference_answer.strip() == student_answer.strip()
            evaluation = {
                "score": 100 if is_match else 0,
                "feedback": "Your answer matches the reference solution." if is_match else 
                           "Your answer doesn't match the reference solution."
            }
        
        # Validate and normalize fields
        if "score" not in evaluation:
            evaluation["score"] = 0
        if "feedback" not in evaluation:
            evaluation["feedback"] = "No feedback provided by evaluator."
            
        # Ensure score is a number between 0-100
        try:
            score = float(evaluation["score"])
            evaluation["score"] = max(0, min(100, score))
        except:
            evaluation["score"] = 0
            
        return evaluation
            
    except Exception as e:
        print(f"Error in evaluation: {str(e)}", file=sys.stderr)
        return {
            "score": 0,
            "feedback": f"Error during evaluation: {str(e)}"
        }

def evaluate_submissions(data):
    """
    Evaluate a list of math question submissions against reference answers.
    
    Expected input format:
    {
        "submissions": [
            {
                "questionId": "123",
                "question": "Evaluate the integral...",
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
                "score": 85,
                "feedback": "Feedback text"
            },
            ...
        ]
    }
    """
    try:
        # Initialize model once for all evaluations
        model, tokenizer, device = setup_model()
        if not model or not tokenizer:
            return {"success": False, "error": "Failed to initialize the DeepMath model"}
        
        results = []
        
        for submission in data.get("submissions", []):
            question_id = submission.get("questionId")
            question_text = submission.get("question", "")
            student_answer = submission.get("answer", "")
            reference_answer = submission.get("referenceAnswer", "")
            
            # Calculate score using the model
            evaluation = evaluate_math_answer(model, tokenizer, device, question_text, student_answer, reference_answer)
            
            # Round score to 1 decimal place
            score = round(evaluation.get("score", 0), 1)
            
            results.append({
                "questionId": question_id,
                "score": score,
                "feedback": evaluation.get("feedback", "No feedback provided.")
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