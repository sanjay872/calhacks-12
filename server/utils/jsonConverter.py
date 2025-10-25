import os
import json
import re
from openai import OpenAI

# Initialize once globally
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_llm_as_json(prompt: str, model: str = "gpt-4o-mini", max_retries: int = 2):
    """
    Calls an LLM and forces a valid JSON response.
    - Handles ```json``` blocks, extra text, malformed JSON.
    - Retries once if JSON decoding fails.

    Args:
        prompt (str): The full prompt text you send to the model.
        model (str): The OpenAI model name.
        max_retries (int): How many times to retry parsing.

    Returns:
        dict: Parsed JSON result, or {'error': ..., 'raw': ...} on failure.
    """
    for attempt in range(max_retries):
        try:
            completion = client.chat.completions.create(
                model=model,
                temperature=0.2,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise data-returning model. "
                                   "Always respond ONLY with valid JSON—no text before or after."
                    },
                    {"role": "user", "content": prompt}
                ],
            )

            raw = completion.choices[0].message.content.strip()

            # --- Step 1: Clean markdown wrappers like ```json ... ```
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0]
            elif "```" in raw:
                raw = raw.split("```")[1]

            # --- Step 2: Extract first JSON object using regex fallback
            match = re.search(r"\{[\s\S]*\}", raw)
            if match:
                raw_json_str = match.group(0)
            else:
                raw_json_str = raw

            # --- Step 3: Parse JSON
            result = json.loads(raw_json_str)
            return result

        except json.JSONDecodeError as e:
            print(f"⚠️ JSON decode error (attempt {attempt+1}): {e}")
            prompt = (
                f"The previous response was invalid JSON. "
                f"Please reformat and return valid JSON only.\n\n{raw}"
            )
        except Exception as e:
            print(f"❌ LLM call failed: {e}")
            return {"error": str(e)}

    # --- Step 4: Fallback
    return {"error": "Failed to produce valid JSON after retries", "raw": raw}
