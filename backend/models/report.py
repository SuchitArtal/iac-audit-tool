from typing import Dict, List, Union, Any
from pydantic import BaseModel, Field
from .finding import FindingModel

class ReportModel(BaseModel):
    summary: Dict[str, int] = Field(description="Severity breakdown")
    count: int = Field(description="Total number of findings")
    findings: List[FindingModel]
    # Allow nested structures like SARIF (dict) in metadata
    metadata: Dict[str, Any]
