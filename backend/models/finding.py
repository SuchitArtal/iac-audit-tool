from pydantic import BaseModel


class FindingModel(BaseModel):
    id: str
    severity: str
    title: str
    file: str
    resource: str
    recommendation: str
