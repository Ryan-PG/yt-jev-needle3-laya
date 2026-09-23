import time
from laya import Router

# Preload checkpoints into memory for instant sub-35ms routing
router = Router(preload=True)

state = {
    "from": "user@acme.com",
    "subject": "Duplicate charge on invoice #4411",
    "body": "Hi, we were billed twice for March. Please refund the duplicate today or we will cancel our plan."
}

questions = {
    "department": {
        "type": "choice",
        "instructions": "Which department should handle this request?",
        "criteria": {
            "billing": "invoices, payments, refunds",
            "technical": "bugs, outages, system errors",
            "sales": "pricing, new contracts",
            "other": "everything else"
        }
    },
    "urgency": {
        "type": "score",
        "instructions": "How urgent is this request?",
        "criteria": ["not urgent", "soon", "critical deadline or blocking issue"]
    },
    "churn_risk": {
        "type": "noul",
        "instructions": "Does the user threaten to cancel or leave?"
    },
    "refund_requested": {
        "type": "noul",
        "instructions": "Does the user explicitly request a refund?"
    }
}

# 1. English state -> automatically routed to ModernBERT-large (39.5 ms)
start_time_en = time.time()
res_en = router.predict(state, questions)
end_time_en = time.time()
print("Department :", res_en["answers"]["department"]["choice"])  # -> billing (confidence: 0.94)
print("Routing    :", res_en["routing"]["model"])                 # -> english
print(f"Part 1 Execution time: {end_time_en - start_time_en:.4f} seconds")

# 2. Hindi state -> automatically routed to mmBERT-base (100+ languages, 32.8 ms)
start_time_hi = time.time()
res_hi = router.predict({"body": "मुझसे दो बार शुल्क लिया गया, कृपया पैसे वापस करें।"}, questions)
end_time_hi = time.time()
print("Department :", res_hi["answers"]["department"]["choice"])  # -> billing (confidence: 0.86)
print("Routing    :", res_hi["routing"]["model"])                 # -> multilingual
print(f"Part 2 Execution time: {end_time_hi - start_time_hi:.4f} seconds")

# 3. Explicit override when you already know the checkpoint
start_time_td = time.time()
res_td = router.predict(state, questions, model="typed-decisions")
end_time_td = time.time()
print(f"Part 3 Execution time: {end_time_td - start_time_td:.4f} seconds")