from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, AsyncGenerator
import openai
from openai import AsyncOpenAI
import json
import logging
from pathlib import Path
from ..settings import LOG_DIR, AI_API_BASE_URL, AI_API_KEY
import asyncio

log_file = Path(LOG_DIR) / "ai_requests.log"
logging.basicConfig(
    filename=str(log_file),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

client = AsyncOpenAI(
    base_url=AI_API_BASE_URL,
    api_key=AI_API_KEY
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)

class Message(BaseModel):
    role: str
    content: str

class TemplateRequest(BaseModel):
    messages: List[Message]

SYSTEM_PROMPT = r"""You are a ticket template design assistant. Help users design workflow templates based on their requirements.

Please respond in this exact format:
1. First, write "Here's my suggestion for your workflow template:" (required)
2. Then, write a brief explanation (required)
3. Finally, output the complete template in this format (required):

<template>
{
    "name": "Template name",                 // Required
    "description": "Template description",     // Required
    "title_format": "Type: {variable}",       // Required
    "default_priority": "low|medium|high",    // Required
    "workflow": [                            // Required, at least one step
        {
            "id": "step_1",                   // Required, unique
            "name": "Step name",              // Required
            "description": "Step description", // Required
            "assignable_roles": ["role1", "role2"],  // Required, non-empty
            "dependencies": [],               // Required
            "form": [                         // Required
                {
                    "id": "field_1",           // Required, unique within step
                    "name": "field_name",      // Required
                    "type": "text|textarea|number|select|checkbox_group|radio_group|datetime|file",  // Required
                    "label": "Field Label",    // Required
                    "required": true,          // Required
                    "validation": {            // Required for text, textarea, number
                        "min_length": 0,
                        "max_length": 100
                    },
                    "width": "full|1/2|1/3",   // Required
                    "help_text": "Helper text",
                    "placeholder": "Placeholder text",
                    "options": ["option1", "option2"]  // Required for select, checkbox_group, radio_group
                }
            ]
        }
    ],
    "workflow_config": {                     // Required
        "parallel_execution": false,         // Required
        "auto_assignment": true,            // Required
        "notification_rules": [             // Required, at least one rule
            {
                "event": "step_completed",    // Required
                "notify_roles": ["manager"],  // Required, non-empty
                "channels": ["email"]         // Required, non-empty
            }
        ]
    }
}
</template>

Requirements:
1. Always use <template> markers instead of ```json
2. Ensure JSON is properly formatted and valid
3. Include all required fields
4. Use correct field types
5. Make all IDs unique
6. Dependencies must reference valid step IDs

Please provide your workflow requirements, and I'll help you design a suitable template."""

async def stream_chat_response(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    """Stream the chat response"""
    try:
        stream = await client.chat.completions.create(
            model="deepseek/deepseek-r1/community",
            messages=messages,
            stream=True,
            temperature=0.7,
            max_tokens=2048
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                content = chunk.choices[0].delta.content
                yield content
                await asyncio.sleep(0.01)
                
    except Exception as e:
        logger.exception("Error in stream_chat_response:")
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )

@router.post("/template-suggest")
async def suggest_template(request: TemplateRequest) -> StreamingResponse:
    """Generate template suggestion using AI"""
    try:
        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT.strip()
            }
        ]
        messages.extend([
            {
                "role": msg.role,
                "content": msg.content.strip()
            } for msg in request.messages
        ])

        return StreamingResponse(
            stream_chat_response(messages),
            media_type="text/event-stream"
        )

    except Exception as e:
        logger.exception("Template suggestion failed:")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate template: {str(e)}"
        )