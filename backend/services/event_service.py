import asyncio
import json
import time
from typing import Dict, Set, AsyncGenerator, Optional
from dataclasses import dataclass, field


@dataclass
class ProjectEvent:
    """An event payload broadcast to project subscribers."""
    event: str  # e.g. task_created, task_updated, task_deleted, comment_added, member_joined, role_changed
    project_id: int
    data: dict
    user_id: Optional[int] = None
    timestamp: float = field(default_factory=time.time)


class EventManager:
    """
    Manages SSE connections per project.

    Each project has a set of async Queues — one per connected client.
    When an event is published for a project, it's pushed to every
    connected client subscribed to that project.
    """

    def __init__(self):
        self._queues: Dict[int, Set[asyncio.Queue]] = {}

    # ------------------------------------------------------------------
    # Client lifecycle
    # ------------------------------------------------------------------

    def subscribe(self, project_id: int) -> asyncio.Queue:
        """Register a new subscriber queue for a project."""
        queue: asyncio.Queue = asyncio.Queue()
        if project_id not in self._queues:
            self._queues[project_id] = set()
        self._queues[project_id].add(queue)
        return queue

    def unsubscribe(self, project_id: int, queue: asyncio.Queue) -> None:
        """Remove a subscriber queue."""
        if project_id in self._queues:
            self._queues[project_id].discard(queue)
            if not self._queues[project_id]:
                del self._queues[project_id]

    # ------------------------------------------------------------------
    # Publishing
    # ------------------------------------------------------------------

    async def publish(self, event: ProjectEvent) -> None:
        """Broadcast an event to all subscribers of the project."""
        payload = json.dumps({
            "event": event.event,
            "project_id": event.project_id,
            "data": event.data,
            "user_id": event.user_id,
            "timestamp": event.timestamp,
        })

        queues = self._queues.get(event.project_id, set()).copy()
        for queue in queues:
            try:
                await queue.put(payload)
            except Exception:
                pass  # Drop for slow consumers

    # ------------------------------------------------------------------
    # Async generator for the SSE stream
    # ------------------------------------------------------------------

    async def event_stream(self, project_id: int, queue: asyncio.Queue) -> AsyncGenerator[str, None]:
        """Yield SSE-formatted messages. Runs until the client disconnects."""
        try:
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {payload}\n\n"
                except asyncio.TimeoutError:
                    # Send keepalive comment to maintain the connection
                    yield ": keepalive\n\n"
        finally:
            self.unsubscribe(project_id, queue)


# Singleton
event_manager = EventManager()
