from pydantic import BaseModel


class TopoNodeOut(BaseModel):
    node_id: str
    label: str
    type: str
    up: bool
    cpu: float
    infected: bool


class TopoLinkOut(BaseModel):
    link_id: str
    from_node: str
    to_node: str
    up: bool
    rtt_ms: float
