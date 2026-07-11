import google.generativeai as genai
from typing import Optional, List
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-pro")
        self.enabled = bool(settings.GEMINI_API_KEY)

    def _generate(self, prompt: str) -> str:
        if not self.enabled:
            return "AI service is not configured. Please set GEMINI_API_KEY in your environment variables."

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"AI service error: {str(e)}"

    def task_breakdown(self, task_title: str, description: Optional[str] = None) -> dict:
        prompt = f"""
        You are a project management AI assistant. Break down the following task into smaller, actionable subtasks.

        Task Title: {task_title}
        {"Description: " + description if description else ""}

        Please provide:
        1. A list of 5-8 specific subtasks needed to complete this task
        2. A brief explanation of the recommended approach

        Format your response with:
        - Subtasks as a numbered list
        - Explanation after the list
        """

        result = self._generate(prompt)
        return self._parse_task_breakdown(result)

    def _parse_task_breakdown(self, text: str) -> dict:
        lines = text.strip().split("\n")
        subtasks = []
        explanation_lines = []
        in_explanation = False

        for line in lines:
            stripped = line.strip()
            if not stripped:
                in_explanation = True
                continue

            if any(stripped.startswith(f"{i}.") for i in range(1, 10)) or stripped.startswith("- "):
                subtask = stripped.lstrip("0123456789.- ")
                if subtask:
                    subtasks.append(subtask)
                in_explanation = False
            elif in_explanation or any(word in stripped.lower() for word in ["explanation", "approach", "recommend"]):
                in_explanation = True
                explanation_lines.append(stripped)
            elif not subtasks:
                subtasks.append(stripped)

        explanation = " ".join(explanation_lines) if explanation_lines else text

        return {
            "subtasks": subtasks if subtasks else ["Plan and research", "Implement core logic", "Write tests", "Review and deploy"],
            "explanation": explanation,
        }

    def explain_bug(self, error_message: str, code_context: Optional[str] = None) -> dict:
        prompt = f"""
        You are a debugging AI assistant. Analyze the following error and provide a detailed explanation.

        Error Message:
        {error_message}

        {"Code Context:" + code_context if code_context else ""}

        Please provide:
        1. Problem - What is happening
        2. Root Cause - Why is it happening
        3. Solution - How to fix it

        Be specific and practical in your solution.
        """

        result = self._generate(prompt)

        sections = {"problem": "", "root_cause": "", "solution": ""}
        current_section = None

        for line in result.split("\n"):
            lower = line.strip().lower()
            if "problem" in lower or "what is happening" in lower:
                current_section = "problem"
            elif "root cause" in lower or "why" in lower:
                current_section = "root_cause"
            elif "solution" in lower or "how to fix" in lower:
                current_section = "solution"
            elif current_section and line.strip():
                sections[current_section] += line.strip() + " "

        return {
            "problem": sections["problem"].strip() or "Unable to parse the error automatically.",
            "root_cause": sections["root_cause"].strip() or "Analysis could not determine the root cause.",
            "solution": sections["solution"].strip() or "Please provide more context for a specific solution.",
        }

    def generate_documentation(self, project_name: str, description: str, features: List[str], doc_type: str = "readme") -> str:
        if doc_type == "readme":
            prompt = f"""
            Generate a professional README.md documentation for the following project.

            Project Name: {project_name}
            Description: {description}
            Features:
            {chr(10).join('- ' + f for f in features)}

            Include:
            1. Project title and description
            2. Features list
            3. Tech stack
            4. Installation instructions
            5. Usage guide
            6. API documentation summary
            7. Contributing guidelines
            8. License

            Format in clean markdown.
            """
        elif doc_type == "api":
            prompt = f"""
            Generate comprehensive API documentation for the following project.

            Project Name: {project_name}
            Description: {description}
            Features:
            {chr(10).join('- ' + f for f in features)}

            Include:
            1. API overview
            2. Authentication
            3. Endpoints with request/response examples
            4. Error codes
            5. Rate limiting

            Format in clean markdown.
            """
        elif doc_type == "release":
            prompt = f"""
            Generate release notes for version 1.0.0 of the following project.

            Project Name: {project_name}
            Description: {description}
            Features:
            {chr(10).join('- ' + f for f in features)}

            Include:
            1. Version and release date
            2. What's new
            3. Improvements
            4. Bug fixes
            5. Known issues

            Format in clean markdown.
            """
        else:
            return "Invalid documentation type. Supported types: readme, api, release."

        return self._generate(prompt)


gemini_service = GeminiService()
