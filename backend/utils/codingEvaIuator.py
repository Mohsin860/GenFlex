#!/usr/bin/env python3
import sys
import json
import traceback
import os
import re
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Model ID for the fine-tuned model
MODEL_ID = "harisgul031/Deepseek_finetuned_for_Genflex_Evaluation"

def setup_model():
    """
    Setup the fine-tuned Deepseek model for evaluation
    """
    try:
        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
        model = AutoModelForCausalLM.from_pretrained(MODEL_ID, torch_dtype=torch.float16, device_map="auto")
        
        return model, tokenizer
    except Exception as e:
        print(f"Error setting up model: {str(e)}", file=sys.stderr)
        return None, None

def generate_response(model, tokenizer, prompt, max_length=2048):
    """
    Generate a response from the model based on the given prompt
    """
    try:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # Generate response
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_new_tokens=max_length,
                do_sample=False,  # Deterministic generation
                temperature=0.7,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Remove the original prompt from the response
        response = response[len(tokenizer.decode(inputs.input_ids[0], skip_special_tokens=True)):]
        
        return response.strip()
    except Exception as e:
        print(f"Error generating response: {str(e)}", file=sys.stderr)
        return f"Error generating response: {str(e)}"

def evaluate_coding_answer(model, tokenizer, question, student_answer, reference_answer):
    """
    Use the fine-tuned model to evaluate a coding answer
    
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
        Evaluate the student's solution for the following coding question.

        **Question:** {question}

        **Student's Answer:**  
        {student_answer}

        **Reference Correct Answer:** {reference_answer}

        ### **Instructions for Evaluation:** 
        1. Remember that 80 percent marks are for reference solution provided by teacher and 10 percent for correct logic and approach and 10 percent for code structure, readability, and adherence to best practices.
        2. Give a rating between **0 to 100** based on correctness, efficiency, and robustness.
        3. Strictly evaluate with respect to teacher reference answer rather than your own logic, even if teacher answer is wrong you have to adhere to that solution for marking.
        4. Don't give high level feedback just give 1 line simple and generic feedback in very simple english.
        

        **Response Format - Provide ONLY a JSON object with these fields:**  
        {{
            "score": [Rating between 0-100],
            "feedback": "[Your simple feedback to the student]"
        }}
        """

        # Get model response
        response_text = generate_response(model, tokenizer, evaluation_prompt)
        
        # Extract JSON from response
        try:
            # Try to find JSON pattern in the response
            json_pattern = r'(\{[\s\S]*"score"[\s\S]*"feedback"[\s\S]*\})'
            json_match = re.search(json_pattern, response_text)
            
            if json_match:
                json_str = json_match.group(1)
            else:
                # Find JSON object in the response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                
                if start_idx == -1 or end_idx == 0:
                    raise ValueError("No JSON object found in response")
                    
                json_str = response_text[start_idx:end_idx]
            
            # Clean the JSON string
            json_str = json_str.replace("'", '"')
            evaluation = json.loads(json_str)
            
            # Validate fields
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
            print(f"JSON parsing error: {str(e)}", file=sys.stderr)
            print(f"Response text: {response_text}", file=sys.stderr)
            
            # If JSON parsing fails, create a basic evaluation
            if student_answer.strip() == reference_answer.strip():
                return {"score": 100, "feedback": "Correct code implementation."}
            else:
                return {"score": 0, "feedback": "Incorrect implementation. Please review your code."}
            
    except Exception as e:
        print(f"Evaluation error: {str(e)}", file=sys.stderr)
        return {
            "score": 0,
            "feedback": f"Error during evaluation: {str(e)}"
        }

def evaluate_submissions(data):
    """
    Evaluate a list of coding question submissions against reference answers.
    
    Expected input format:
    {
        "submissions": [
            {
                "questionId": "123",
                "question": "Write a function to...",
                "answer": "Student's code answer text",
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
        # Load model once for all evaluations
        model, tokenizer = setup_model()
        if not model or not tokenizer:
            return {"success": False, "error": "Failed to load evaluation model"}
        
        results = []
        
        for submission in data.get("submissions", []):
            question_id = submission.get("questionId")
            question_text = submission.get("question", "")
            student_answer = submission.get("answer", "")
            reference_answer = submission.get("referenceAnswer", "")
            
            # Calculate score
            evaluation = evaluate_coding_answer(model, tokenizer, question_text, student_answer, reference_answer)
            
            # Round score to 1 decimal place
            score = round(evaluation.get("score", 0), 1)
            
            # Construct feedback from various evaluation parts
            feedback = evaluation.get("feedback", "No feedback provided.")
            if "mistakes" in evaluation and evaluation["mistakes"]:
                feedback += f"\n\nMistakes identified: {evaluation['mistakes']}"
            if "suggestions" in evaluation and evaluation["suggestions"]:
                feedback += f"\n\nSuggestions: {evaluation['suggestions']}"
            
            results.append({
                "questionId": question_id,
                "score": score,
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