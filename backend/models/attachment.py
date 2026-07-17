from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    content_type = Column(String(200), nullable=False)
    file_size = Column(BigInteger, default=0)
    storage_path = Column(String(1000), nullable=False)
    bucket = Column(String(100), default="attachments")
    created_at = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", backref="attachments")
    user = relationship("User", backref="attachments")
