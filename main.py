#!/usr/bin/env python3
"""AI Economics - Claude Integration"""

import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8', errors='replace')

import anthropic
from pathlib import Path

# Claude API Configuration
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "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")

# Initialize Claude client
claude = anthropic.Anthropic(api_key=CLAUDE_API_KEY)


def analyze_economics(text, topic=""):
    """Analyze economic content using Claude."""
    print("\n[+] Sending to Claude API for economic analysis...")
    
    prompt = (
        "You are an expert economist and AI researcher. Analyze the following content "
        "from the perspective of AI economics - how artificial intelligence impacts "
        "economic systems, markets, labor, productivity, and policy.\n\n"
    )
    
    if topic:
        prompt += f"Topic: {topic}\n\n"
    
    prompt += f"Content to analyze:\n{text}\n\n"
    prompt += (
        "Provide a comprehensive analysis covering:\n"
        "- Key economic implications\n"
        "- AI's impact on markets and productivity\n"
        "- Policy considerations\n"
        "- Future economic trends\n"
        "\nFormat as clear, structured analysis with no markdown formatting."
    )
    
    try:
        response = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"[!] Error: {e}")
        return None


def chat_with_claude(message):
    """Simple chat interface with Claude for economics discussions."""
    print("\n[+] Sending message to Claude...")
    
    try:
        response = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": message}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"[!] Error: {e}")
        return None


if __name__ == "__main__":
    print("AI Economics - Claude Integration")
    print("=" * 40)
    
    # Example usage
    example_text = "AI is transforming the global economy through automation and productivity gains."
    result = analyze_economics(example_text, "AI and Productivity")
    
    if result:
        print("\n[+] Analysis Result:")
        print(result)
    else:
        print("\n[!] Failed to get analysis")
