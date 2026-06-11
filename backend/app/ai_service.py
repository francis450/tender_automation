import os
import logging
from typing import Optional
from openai import OpenAI
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class DraftingService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        
        self.openai_client = OpenAI(api_key=self.openai_api_key) if self.openai_api_key else None
        self.anthropic_client = Anthropic(api_key=self.anthropic_api_key) if self.anthropic_api_key else None

    async def generate_draft(self, section_title: str, section_content: str, full_context: str, provider: str = "openai") -> str:
        prompt = f"""
You are a professional proposal writer. Your task is to draft a response for a specific section of a tender document (RFP/TOR).

FULL DOCUMENT CONTEXT:
\"\"\"{full_context[:2000]}...\"\"\" (truncated for brevity)

SECTION TO RESPOND TO:
Title: {section_title}
Original Content:
{section_content}

INSTRUCTIONS:
1. Write a professional, compelling response for this section.
2. Align the response with the requirements and context provided in the full document.
3. Use a tone that is confident, expert, and client-focused.
4. Ensure the response is practical and directly addresses the points in the original section content.
5. Format the output clearly.

PROPOSAL RESPONSE:
"""

        if provider == "openai" and self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are an expert proposal writer."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1500
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI error: {e}")
                return self._fallback_draft(section_title)

        elif provider == "anthropic" and self.anthropic_client:
            try:
                response = self.anthropic_client.messages.create(
                    model="claude-3-5-sonnet-20240620",
                    max_tokens=1500,
                    system="You are an expert proposal writer.",
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text
            except Exception as e:
                logger.error(f"Anthropic error: {e}")
                return self._fallback_draft(section_title)

        else:
            return self._fallback_draft(section_title)

    def _fallback_draft(self, section_title: str) -> str:
        return f"""
[MOCK AI DRAFT FOR: {section_title}]

This is a placeholder response generated because no AI API keys were provided or an error occurred. 

In a real scenario, this section would contain a professionally written response to the '{section_title}' requirements of the tender document. 

Key points to include:
- Executive summary of our approach to {section_title}.
- Detailed methodology and implementation plan.
- Evidence of past success in similar projects.
- Value-added benefits of choosing our firm.
"""

drafting_service = DraftingService()
