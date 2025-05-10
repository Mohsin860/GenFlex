#!/usr/bin/env python3
import sys
import json
import traceback
import os
from hugchat import hugchat
from hugchat.login import Login

# HuggingFace login credentials
EMAIL = "harisgul031@gmail.com"
PASSWD = "HcestLavie123@@"

def setup_chatbot():
    try:
        # Setup login cookies dir
        cookie_path_dir = os.path.join(os.path.dirname(__file__), 'cookies')
        os.makedirs(cookie_path_dir, exist_ok=True)
        
        # Login to Hugging Face
        sign = Login(EMAIL, PASSWD)
        cookies = sign.login(cookie_dir_path=cookie_path_dir, save_cookies=True)
        chatbot = hugchat.ChatBot(cookies=cookies.get_dict())
        chatbot.new_conversation()
        return chatbot
    except Exception as e:
        print(f"Error setting up chatbot: {str(e)}", file=sys.stderr)
        return None

def evaluate_coding_answer(question, student_answer, reference_answer):
    """
    Use HuggingFace's chatbot to evaluate a coding answer
    
    Returns a dict with score and feedback
    """
    try:
        chatbot = setup_chatbot()
        if not chatbot:
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
        1. Remember that 80 percent marks are for refernce solution provided by teacher and 10 percent for correct logic and approach and 10 percent for code structure, readability, and adherence to best practices.
        7. Give a rating between **0 to 100** based on correctness, efficiency, and robustness.
        8. strictly evaluate with respect to teacher reference answer rather than your own logic , even if teacher answer is wrong you have to adhere to that solution for marking.
        9. dont give high level feedback just give 1 line simple and generic feedback in very simple english.
        

        **Response Format - Provide ONLY a JSON object with these fields:**  
        {{
            "score": [Rating between 0-100],
            "feedback": "[Your simple feedback to the student]"
        }}
        """

        # Get AI feedback
        response = chatbot.chat(evaluation_prompt)
        response_text = str(response)
        
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
            # If JSON parsing fails, create a basic evaluation
            return {
                "score": 0 if reference_answer.strip() != student_answer.strip() else 100,
                "feedback": f"Unable to provide detailed feedback. Please check if your answer matches the expected output."
            }
            
    except Exception as e:
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