import os
from openai import OpenAI
import re
from collections import Counter

STOPWORDS = {
    'the', 'a', 'an', 'and', 'is', 'are', 'was', 'were', 'to', 'of', 
    'in', 'on', 'for', 'with', 'at', 'by', 'from', 'this', 'that', 
    'it', 'as', 'be', 'or', 'but', 'not', 'so', 'if', 'then', 'i', 
    'you', 'we', 'he', 'she', 'they', 'them', 'my', 'your', 'our'
}


def extract_keywords(text, top_n=10):
    # extract all word-like chunks
    words = re.findall(r'\b\w+\b', text.lower())

    meaningful_words = [word for word in words if word not in STOPWORDS]
    # count the most common words
    counter = Counter(meaningful_words)

    # Return the top_n most common words
    return [word for word, count in counter.most_common(top_n)]

def score_memories(memories, current_keywords):
    scores = []
    for memory in memories:
        memory_keywords = extract_keywords(memory.entry)
        overlap = len(set(current_keywords) & set(memory_keywords))
        scores.append((memory, overlap))
    return sorted(scores, key=lambda x: x[1], reverse=True)

def summarize_memories(top_3_memories):
    client = OpenAI(
    api_key = os.environ.get('OPENAI_API_KEY')
    )
    memory_summaries = []
    for memory, _ in top_3_memories:
        mini_summary_response = client.responses.create(
            model='gpt-4o',
            instructions='Summarize this journal entry in **one sentence**. Just the essence of what happend and how the person felt.',
            input=memory.entry
        )
        memory_summaries.append(mini_summary_response.output_text.strip())
    return memory_summaries
    