import needle


@needle.tool
def get_weather(city: str):
    """Get the current weather for a city."""
    print(f"[TOOL] get_weather({city})")

    return {
        "city": city,
        "temperature": 27,
        "condition": "clear",
    }


@needle.tool
def send_email(to: str, subject: str, body: str):
    """Send an email to a recipient."""
    print(f"[TOOL] send_email(to={to}, subject={subject})")

    return {
        "success": True,
        "message": f"Email sent to {to}",
    }


@needle.tool
def turn_on_light(room: str):
    """Turn on the light in a room."""
    print(f"[TOOL] turn_on_light({room})")

    return {
        "success": True,
        "room": room,
        "state": "on",
    }


agent = needle.Needle(
    tools=[
        get_weather,
        send_email,
        turn_on_light,
    ],
    generation=3,
)

result = agent.run(
    "What's the weather like in Tehran?"
)

print("\nRESULT:")
print(result)