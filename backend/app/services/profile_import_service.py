import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"

def get_local_profile():
    profile_path = DATA_DIR / "profile.json"
    if profile_path.exists():
        with open(profile_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def get_linkedin_profile():
    linkedin_path = DATA_DIR / "linkedin_profile.json"
    if linkedin_path.exists():
        with open(linkedin_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def merge_profile_data():
    """
    Merges local profile data with LinkedIn data.
    Local profile data takes precedence.
    """
    local = get_local_profile()
    linkedin = get_linkedin_profile()
    
    # Merge linkedin details into local if missing
    merged = {**linkedin, **local}
    return merged

