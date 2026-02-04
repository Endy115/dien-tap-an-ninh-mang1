from pydantic import BaseModel, ConfigDict

class TopologyCreate(BaseModel):
    scenario_id: int
    name: str
    description: str | None = None
    layout: dict | None = None

class TopologyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    topo_id: int
    scenario_id: int
    name: str
    description: str | None = None
    layout: dict | None = None

class DeviceCreate(BaseModel):
    topo_id: int
    role_id: int | None = None
    device_type: str
    hostname: str
    ip_address: str | None = None
    meta: dict | None = None

class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    device_id: int
    topo_id: int
    role_id: int | None = None
    device_type: str
    hostname: str
    ip_address: str | None = None
    meta: dict | None = None
