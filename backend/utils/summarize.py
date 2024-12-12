import torch
from transformers import BartForConditionalGeneration, BartTokenizer
import re
from pdfminer.high_level import extract_text
import sys
import os

def clean_text(text):
    cleaned_text = re.sub(r'\s+', ' ', text)
    cleaned_text = cleaned_text.replace("'", "")
    return cleaned_text.strip()

def split_into_sentences(text):
    text = text.replace('?', '.|')
    text = text.replace('!', '.|')
    text = text.replace('.', '.|')
    sentences = text.split('.|')
    return [s.strip() for s in sentences if s.strip()]

def summarize_large_text_with_bart(input_text):
    try:
        model_name = "facebook/bart-large-cnn"
        model = BartForConditionalGeneration.from_pretrained(model_name)
        tokenizer = BartTokenizer.from_pretrained(model_name)
        
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model.to(device)
        
        cleaned_text = clean_text(input_text)
        inputs = tokenizer.encode(cleaned_text, return_tensors='pt', max_length=1024, truncation=True)
        inputs = inputs.to(device)
        
        summary_ids = model.generate(
            inputs,
            max_length=1024,
            min_length=100,
            num_beams=4,
            length_penalty=2.0,
            early_stopping=True
        )
        
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        sentences = split_into_sentences(summary)
        bullet_points = '\n'.join([f'• {sentence.strip()}' for sentence in sentences if sentence.strip()])
        
        return bullet_points
        
    except Exception as e:
        raise Exception(f"Summarization failed: {str(e)}")

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            raise Exception("Please provide PDF file path")
            
        pdf_path = sys.argv[1]
        
        if not os.path.exists(pdf_path):
            raise Exception(f"PDF file not found: {pdf_path}")
            
        text_pdf = extract_text(pdf_path)
        
        if not text_pdf.strip():
            raise Exception("No text could be extracted from the PDF")
            
        summary = summarize_large_text_with_bart(text_pdf)
        print(summary, end='')
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)