import os
import requests

API_KEY = os.environ["TYPESAFE_API_KEY"]

url = "https://api.typesafe.ai/v1/systemone"

state = """
Hi, I've been charged twice for my subscription this month.
I've already contacted support once and haven't received a response.
Please fix this as soon as possible.
"""

payload = {
    "state": state,
    "model": "jev-latest",
    "questions": {
        "department": {
            "type": "choice",
            "instructions": "Which team should handle this issue?",
            "criteria": {
                "billing": "Payment, invoice, or subscription issues",
                "technical": "Bugs or technical problems",
                "sales": "Pricing or sales questions",
            },
        },
        "frustration": {
            "type": "score",
            "instructions": "How frustrated does the customer appear?",
            "criteria": [
                "Calm, just stating facts",
                "Frustrated but civil",
                "Very angry or using strong language",
            ],
        },
        "is_urgent": {
            "type": "noul",
            "instructions": "Does the message express urgency or time-sensitivity?",
        },
    },
}

response = requests.post(
    url,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    },
    json=payload,
    timeout=60,
)

response.raise_for_status()

data = response.json()

print("JEV Response:")
print(data)

print("\nResults:")

answers = data["answers"]

print("Department:", answers["department"]["choice"])
print("Frustration:", answers["frustration"]["score"])
print("Urgent:", answers["is_urgent"]["noul"])