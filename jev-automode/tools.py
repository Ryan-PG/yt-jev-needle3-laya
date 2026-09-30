from langchain.tools import tool


@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    return f"The weather in {city} is sunny and 24°C."


@tool
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email to a recipient."""
    return (
        f"Email sent successfully.\n"
        f"To: {to}\n"
        f"Subject: {subject}\n"
        f"Body: {body}"
    )


@tool
def shutdown_server(server: str) -> str:
    """Shut down a production server. This is a destructive operation."""
    return f"Server {server} has been shut down."


tools = [
    get_weather,
    send_email,
    shutdown_server,
]