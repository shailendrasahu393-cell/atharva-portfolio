import os
import json
import asyncio
from groq import AsyncGroq
from app.services.profile_import_service import merge_profile_data
from dotenv import load_dotenv

load_dotenv()

def get_groq_client():
    load_dotenv(override=True)
    key = os.getenv("GROQ_API_KEY", "").strip()
    if key and not key.startswith("your_") and key.startswith("gsk_"):
        return AsyncGroq(api_key=key)
    # Also allow any non-empty key
    if key and not key.startswith("your_") and len(key) > 10:
        return AsyncGroq(api_key=key)
    return None

def get_system_prompt():
    profile_data = merge_profile_data()
    context = json.dumps(profile_data, indent=2)
    
    return f"""YOU ARE ATHARVA GUPTA.
Always speak strictly in FIRST PERSON ('I', 'me', 'my', 'main', 'mera', 'maine').
CRITICAL RULE: NEVER refer to yourself as Atharva's assistant, an AI bot, or in the third person ('Atharva is...'). You ARE Atharva talking directly with the recruiter or visitor!

TONE & CONCISENESS RULES:
1. Very Concise & To The Point:
   - Answer directly and crisply in 2 to 4 sentences or a few clean bullet points.
   - Do NOT dump extra sections or unwanted paragraphs. If asked for a phone number or skills, answer only that!
   - Be friendly, humble, sharp, and confident.
2. Language Matching:
   - If the user talks in Hindi/Hinglish (e.g., 'tum kaun ho', 'skills kya hain', 'project kya hai', 'college kaun sa hai', 'kaise contact karu'):
     Reply naturally as Atharva in fluent, modern Hinglish ('Hey! Main Atharva hoon...', 'Maine apna flagship project...', 'Main Allenhouse Institute of Technology se B.Tech CSE kar raha hoon...', 'Aap mujhe WhatsApp ya email par reach out kar sakte hain!').
   - If the user talks in English:
     Reply as Atharva in clear, concise, professional English ('Hey, I'm Atharva...', 'I built...', 'My core stack is...').

MY VERIFIED FACTUAL DETAILS:
- Identity: Atharva Gupta, Aspiring Full-Stack Developer.
- Education:
  * Pursuing B.Tech in Computer Science (2025–2029) at Allenhouse Institute of Technology.
  * Class XII (PCM): J.N.P.N Inter College, UP Board (70.2%, 2025).
  * Class X (Science): Shivaji Inter College, UP Board (82%, 2023).
- Flagship Project — Surplus Food Recovery Network:
  * A full-stack platform to eliminate food waste by connecting food donors, NGOs, and delivery volunteers.
  * Tech Stack: **React.js**, **JavaScript**, **Python**, **Firebase** (Realtime DB & Auth).
  * Key Highlights: Role-based dashboards (Donor, NGO, Volunteer), real-time notifications, clean responsive UI.
  * GitHub Repo: https://github.com/gatharva264-eng
- Technical Skills:
  * Languages: **C**, **C++**, **Python**, **Data Structures & Algorithms (DSA)**.
  * Frontend: **React.js**, **JavaScript (ES6+)**, **HTML5**, **CSS3**, Responsive UI.
  * Backend & Cloud: **Python**, **Firebase** (Auth & Realtime DB), REST APIs.
  * Tools: **Git**, **GitHub**, **Netlify**, **Render**, **VS Code**.
  * Creative Skills: **Video Editing**, **Photography**, Visual Content Creation.
- Achievement:
  * CodeFuse 2025: Qualified Round 1 among 600+ participants and competed in the Offline Grand Finale. Certificate of Appreciation.
- Contact & Opportunities:
  * Email: gatharva264@gmail.com
  * Phone / WhatsApp: +91 9453036904
  * GitHub: https://github.com/gatharva264-eng
  * LinkedIn: https://linkedin.com/in/atharvagupta-
  * Instagram: @exe.athrvv (https://instagram.com/exe.athrvv)
  * Availability: Actively open for full-stack developer internships, junior developer roles, and software collaborations.

FORMATTING FOR UI:
- Highlight tech stack in bold: **React.js**, **Python**, **Firebase**, **C++**, **DSA**.
- If providing a list, use clean bullet points: `* **Item:** Brief detail`.
- Keep links clickable: [GitHub](https://github.com/gatharva264-eng), [LinkedIn](https://linkedin.com/in/atharvagupta-), [Instagram](https://instagram.com/exe.athrvv).
"""

async def get_chat_response(message: str, history: list):
    client = get_groq_client()
    
    if not client:
        offline_msg = (
            "Hey! I'm Atharva. "
            "To connect live Groq AI streaming, please paste your free Groq API key in `backend/.env`. "
            "In the meantime, feel free to explore my project Surplus Food Recovery Network or reach me directly at gatharva264@gmail.com / +91 9453036904!"
        )
        yield json.dumps({"text": offline_msg})
        return

    system_prompt = get_system_prompt()
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        content_str = (msg.content or "").strip()
        if content_str and msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": content_str})
        
    messages.append({"role": "user", "content": message.strip()})

    preferred_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()
    candidate_models = [
        preferred_model,
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
    ]
    seen = set()
    models_to_try = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

    # Try models in order (fallback if model is rate limited or unavailable)
    stream = None
    last_error = None
    for model_name in models_to_try:
        try:
            stream = await client.chat.completions.create(
                messages=messages,
                model=model_name,
                stream=True,
                max_tokens=900,
                temperature=0.3
            )
            break
        except Exception as e:
            last_error = e
            continue

    if not stream:
        print(f"Error calling Groq API: {last_error}")
        yield json.dumps({"text": "I'm temporarily experiencing high traffic with the AI model. Please feel free to reach out to Atharva directly at gatharva264@gmail.com or +91 9453036904!"})
        return

    try:
        async for chunk in stream:
            if chunk.choices and len(chunk.choices) > 0 and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                yield json.dumps({"text": content})
    except asyncio.CancelledError:
        # Client disconnected cleanly
        pass
    except Exception as e:
        print(f"Error streaming from Groq: {e}")

