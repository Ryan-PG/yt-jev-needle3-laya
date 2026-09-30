from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_typesafe import NoulCriteria
from langchain_typesafe.experimental.middleware import AutoModeMiddleware

from config import (
    AGENT_API_KEY,
    AGENT_BASE_URL,
    AGENT_MODEL,
)

from tools import tools


agent_model = ChatOpenAI(
    model=AGENT_MODEL,
    api_key=AGENT_API_KEY, # type: ignore
    base_url=AGENT_BASE_URL,
    temperature=0,
)


auto_mode = AutoModeMiddleware(
    tools=[
        "send_email",
        "shutdown_server",
    ],
    criteria=NoulCriteria(
        true=(
            "The tool call performs an external side effect, "
            "changes system state, sends a message, deletes data, "
            "changes permissions, or performs a destructive operation."
        ),
        false=(
            "The tool call only reads information or performs a "
            "safe, non-destructive operation without external side effects."
        ),
    ),
)


agent = create_agent(
    model=agent_model,
    tools=tools,
    middleware=[auto_mode],
)


def run_agent(user_input: str) -> None:
    print("\n" + "=" * 70)
    print(f"USER: {user_input}")
    print("=" * 70)

    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": user_input,
                    }
                ]
            }
        )

        print("\nAGENT:")

        for message in result["messages"]:
            if hasattr(message, "content") and message.content:
                print(message.content)

    except Exception as exc:
        print("\nBLOCKED / ERROR:")
        print(type(exc).__name__)
        print(str(exc))


if __name__ == "__main__":
    print(f"Model: {AGENT_MODEL}")
    print(f"Base URL: {AGENT_BASE_URL}")
    print("\nType 'exit' to quit.")

    while True:
        user_input = input("\n> ")

        if user_input.lower() in {"exit", "quit"}:
            break

        run_agent(user_input)