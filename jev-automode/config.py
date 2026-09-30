import os

from dotenv import load_dotenv


load_dotenv()


AGENT_BASE_URL = os.getenv("AGENT_BASE_URL")
AGENT_API_KEY = os.getenv("AGENT_API_KEY")
AGENT_MODEL = os.getenv("AGENT_MODEL", "gpt-5.6")

JEV_BASE_URL = os.getenv("JEV_BASE_URL")
JEV_API_KEY = os.getenv("JEV_API_KEY")
JEV_MODEL = os.getenv("JEV_MODEL")