import os
import sys

from dotenv import load_dotenv

load_dotenv()


def main():
    from src.graph import graph

    question = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else None
    if not question:
        question = input("Research question: ").strip()
    if not question:
        print("No question provided.")
        sys.exit(1)

    print(f"\nResearching: {question}\n")
    print("Planning sub-questions...", flush=True)

    result = graph.invoke({"question": question, "search_results": []})

    print(f"\nSub-questions explored:")
    for i, q in enumerate(result["sub_questions"], 1):
        print(f"  {i}. {q}")

    print("\n" + "=" * 60)
    print(result["synthesis"])


if __name__ == "__main__":
    main()
