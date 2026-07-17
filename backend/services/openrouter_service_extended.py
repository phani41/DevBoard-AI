from typing import Optional, List
from services.openrouter_service import openrouter_service


class OpenRouterServiceExtended:
    """Extended AI features via OpenRouter API."""

    def sprint_planner(
        self,
        project_name: str,
        project_description: str,
        tasks: List[str],
        sprint_duration_days: int = 14,
        team_size: int = 3,
    ) -> dict:
        """Generate a sprint plan."""
        system_prompt = "You are an expert Agile/Scrum project manager. Generate detailed sprint plans."
        user_prompt = f"""
Project: {project_name}
Description: {project_description}
Tasks: {', '.join(tasks)}
Sprint Duration: {sprint_duration_days} days
Team Size: {team_size}

Generate a sprint plan including:
1. Sprint name and goals
2. Task assignments based on team size
3. Milestones
4. Estimated velocity
5. Potential risks

Format as JSON with keys: sprint_name, duration, goals (list), task_assignments (list of {{task, assignee, estimated_hours}}), milestones (list), estimated_velocity (string), risks (list)
"""
        result = openrouter_service._generate(system_prompt, user_prompt)
        return self._parse_json_response(result, {
            "sprint_name": "Sprint 1",
            "duration": f"{sprint_duration_days} days",
            "goals": ["Complete core features"],
            "task_assignments": [],
            "milestones": [],
            "estimated_velocity": "Medium",
            "risks": [],
        })

    def project_summary(self, project_name: str, description: str, features: List[str], stats: Optional[dict] = None) -> dict:
        """Generate an AI project summary."""
        system_prompt = "You are a project management analyst. Create insightful project summaries."
        stats_text = ""
        if stats:
            stats_text = f"Stats: {stats}"

        user_prompt = f"""
Project: {project_name}
Description: {description}
Features: {', '.join(features)}
{stats_text}

Generate a project summary including:
1. Concise summary (2-3 sentences)
2. Key metrics
3. Health score (Good/Needs Attention/Critical)
4. Actionable recommendations

Format as JSON with keys: summary (string), key_metrics (list of strings), health_score (string), recommendations (list of strings)
"""
        result = openrouter_service._generate(system_prompt, user_prompt)
        return self._parse_json_response(result, {
            "summary": f"{project_name} is progressing with {len(features)} features planned.",
            "key_metrics": [f"{len(features)} features planned"],
            "health_score": "Good",
            "recommendations": ["Review feature priorities"],
        })

    def risk_analysis(self, project_name: str, description: str, tasks: List[str], current_status: Optional[str] = None) -> dict:
        """Analyze project risks."""
        system_prompt = "You are a risk management expert. Identify and analyze project risks."
        user_prompt = f"""
Project: {project_name}
Description: {description}
Tasks: {', '.join(tasks)}
Current Status: {current_status or 'In Progress'}

Analyze risks including:
1. List of risks with severity (critical/high/medium/low) and probability
2. Overall risk level
3. Mitigation strategies
4. Critical path items

Format as JSON with keys: risks (list of {{risk, severity, probability, impact}}), overall_risk_level (string), mitigation_strategies (list), critical_path_items (list)
"""
        result = openrouter_service._generate(system_prompt, user_prompt)
        return self._parse_json_response(result, {
            "risks": [],
            "overall_risk_level": "Low",
            "mitigation_strategies": ["Regular status reviews"],
            "critical_path_items": [],
        })

    def task_prioritization(self, tasks: List[dict], criteria: Optional[str] = None) -> dict:
        """Prioritize tasks using AI."""
        system_prompt = "You are a task prioritization expert using techniques like MoSCoW, Eisenhower Matrix, and value vs effort analysis."
        user_prompt = f"""
Tasks: {tasks}
Criteria: {criteria or 'Priority based on urgency and importance'}

Prioritize these tasks including:
1. Ordered list of tasks by priority
2. Rationale for the ordering
3. Recommended first 3 actions

Format as JSON with keys: prioritized_tasks (list of {{title, priority_score, rationale, recommended_action}}), rationale (string), recommended_first_actions (list)
"""
        result = openrouter_service._generate(system_prompt, user_prompt)
        return self._parse_json_response(result, {
            "prioritized_tasks": [],
            "rationale": "Tasks prioritized by urgency and importance.",
            "recommended_first_actions": [],
        })

    def _parse_json_response(self, text: str, fallback: dict) -> dict:
        """Try to parse JSON from AI response, fallback to default dict."""
        import json
        import re

        # Try to find JSON block
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        return fallback


openrouter_extended = OpenRouterServiceExtended()
