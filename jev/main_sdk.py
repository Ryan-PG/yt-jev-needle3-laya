```python
import os

from dotenv import load_dotenv
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

load_dotenv()

api_key = os.getenv("TYPESAFE_API_KEY")

if not api_key:
    raise RuntimeError("TYPESAFE_API_KEY is not set in .env")

client = TypeSafeClient(api_key=api_key)

state = """
Hi, I've been charged twice for my subscription this month.

I've already contacted support once and haven't received a response.

Please fix this as soon as possible.
"""

response = client.system_one(
    state=state,
    questions={
        "department": Choice(
            instructions="Which team should handle this issue?",
            criteria={
                "billing": "Payment, invoice, or subscription issues",
                "technical": "Bugs or technical problems",
                "sales": "Pricing or sales questions",
            },
        ),
        "frustration": Score(
            instructions="How frustrated does the customer appear?",
            criteria=[
                "Calm, just stating facts",
                "Frustrated but civil",
                "Very angry or using strong language",
            ],
        ),
        "is_urgent": Noul(
            instructions="Does the message express urgency or time-sensitivity?",
        ),
    },
)

print("JEV Response:")
print(response)

print("\nResults:")

print("Department:", response.answers["department"].choice)
print("Frustration:", response.answers["frustration"].score)
print("Urgent:", response.answers["is_urgent"].noul)
```
