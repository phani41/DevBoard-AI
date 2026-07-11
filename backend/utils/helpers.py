from datetime import datetime
from typing import Optional, List, Any


def format_date(date: Optional[datetime]) -> Optional[str]:
    if date is None:
        return None
    return date.isoformat()


def parse_date(date_string: Optional[str]) -> Optional[datetime]:
    if date_string is None:
        return None
    try:
        return datetime.fromisoformat(date_string)
    except (ValueError, TypeError):
        return None


def paginate(query, page: int = 1, per_page: int = 20):
    offset = (page - 1) * per_page
    return query.offset(offset).limit(per_page).all()


def count_query(query):
    return query.count()


def serialize_labels(labels: Any) -> List[str]:
    if labels is None:
        return []
    if isinstance(labels, list):
        return labels
    if isinstance(labels, str):
        try:
            import json
            return json.loads(labels)
        except (json.JSONDecodeError, TypeError):
            return [labels]
    return []


def serialize_checklist(checklist: Any) -> List[dict]:
    if checklist is None:
        return []
    if isinstance(checklist, list):
        return checklist
    if isinstance(checklist, str):
        try:
            import json
            return json.loads(checklist)
        except (json.JSONDecodeError, TypeError):
            return []
    return []
