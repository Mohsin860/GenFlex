#!/usr/bin/env python3
import sys
import json
import traceback
import os
from openai import OpenAI

# OpenAI API configuration
API_KEY = "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"

def setup_openai_client():
    """
    Setup OpenAI client
    """
    try:
        client = OpenAI(api_key=API_KEY)
        return client
    except Exception as e:
        print(f"Error setting up OpenAI client: {str(e)}", file=sys.stderr)
        return None

def evaluate_coding_answer(question, student_answer, reference_answer):
    """
    Use OpenAI GPT to evaluate a coding answer
    
    Returns a dict with score and feedback
    """
    try:
        client = setup_openai_client()
        if not client:
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

        # Get AI feedback using OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert code evaluator. Always respond with valid JSON only."},
                {"role": "user", "content": evaluation_prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        response_text = response.choices[0].message.content
        
        # Extract JSON from response
        try:
            # Find JSON object in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON object found in response")
                
            json_str = response_text[start_idx:end_idx]
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
            return {
                "score": 100 if reference_answer.strip() == student_answer.strip() else 0,
                "feedback": "Unable to provide detailed feedback. Please check if your answer matches the expected output."
            }
            
    except Exception as e:
        print(f"OpenAI API error: {str(e)}", file=sys.stderr)
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
        results = []
        
        for submission in data.get("submissions", []):
            question_id = submission.get("questionId")
            question_text = submission.get("question", "")
            student_answer = submission.get("answer", "")
            reference_answer = submission.get("referenceAnswer", "")
            
            # Calculate score
            evaluation = evaluate_coding_answer(question_text, student_answer, reference_answer)
            
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
        print(f"Evaluation error: {str(e)}", file=sys.stderr)
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