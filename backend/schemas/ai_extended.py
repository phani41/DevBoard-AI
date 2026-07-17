from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SprintPlanRequest(BaseModel):
    project_name: str
    project_description: str
    tasks: List[str]
    sprint_duration_days: int = 14
    team_size: int = 3


class SprintPlanResponse(BaseModel):
    sprint_name: str
    duration: str
    goals: List[str]
    task_assignments: List[dict]
    milestones: List[str]
    estimated_velocity: str
    risks: List[str]


class ProjectSummaryRequest(BaseModel):
    project_name: str
    project_description: str
    features: List[str]
    stats: Optional[dict] = None


class ProjectSummaryResponse(BaseModel):
    summary: str
    key_metrics: List[str]
    health_score: str
    recommendations: List[str]


class RiskAnalysisRequest(BaseModel):
    project_name: str
    project_description: str
    tasks: List[str]
    current_status: Optional[str] = None


class RiskAnalysisResponse(BaseModel):
    risks: List[dict]
    overall_risk_level: str
    mitigation_strategies: List[str]
    critical_path_items: List[str]


class TaskPrioritizationRequest(BaseModel):
    tasks: List[dict]
    criteria: Optional[str] = None


class TaskPrioritizationResponse(BaseModel):
    prioritized_tasks: List[dict]
    rationale: str
    recommended_first_actions: List[str]


class SprintPlanResponse(BaseModel):
    sprint_name: str
    duration: str
    goals: list[str]
    task_assignments: list[dict]
    milestones: list[str]
    estimated_velocity: str
    risks: list[str]
