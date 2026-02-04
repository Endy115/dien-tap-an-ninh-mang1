from pydantic import BaseModel, ConfigDict

# ===== Scenario =====
class ScenarioCreate(BaseModel):
    title: str
    description: str | None = None
    time_limit_seconds: int | None = None
    tags: str | None = None
    difficulty: int = 1

class ScenarioUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    time_limit_seconds: int | None = None
    tags: str | None = None
    difficulty: int | None = None

class ScenarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scenario_id: int
    title: str
    description: str | None = None
    time_limit_seconds: int | None = None
    tags: str | None = None
    difficulty: int




# ===== Role =====
class ScenarioRoleCreate(BaseModel):
    scenario_id: int
    role_name: str
    role_description: str | None = None

class ScenarioRoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role_id: int
    scenario_id: int
    role_name: str
    role_description: str | None = None


# ===== Node =====
class ScenarioNodeCreate(BaseModel):
    scenario_id: int
    node_type: str
    is_start: bool = False
    context_text: str | None = None
    topo_id: int | None = None
    screen_id: int | None = None

class ScenarioNodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    node_id: int
    scenario_id: int
    node_type: str
    is_start: bool
    context_text: str | None = None
    topo_id: int | None = None
    screen_id: int | None = None


# ===== Question =====
class QuestionCreate(BaseModel):
    node_id: int
    scenario_id: int
    question_text: str
    order_index: int = 0

class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: int
    node_id: int
    scenario_id: int
    question_text: str
    order_index: int


# ===== Answer =====
class AnswerCreate(BaseModel):
    question_id: int
    answer_text: str
    feedback_text: str | None = None
    impact_score: int = 0
    impact_topology: dict | None = None

class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    answer_id: int
    question_id: int
    answer_text: str
    feedback_text: str | None = None
    impact_score: int
    impact_topology: dict | None = None


# ===== Transition =====
class TransitionCreate(BaseModel):
    answer_id: int
    destination_node_id: int | None = None
    trigger_type: str | None = None
    condition: str | None = None
    delay_seconds: int | None = None

class TransitionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    transition_id: int
    answer_id: int
    destination_node_id: int | None = None
    trigger_type: str | None = None
    condition: str | None = None
    delay_seconds: int | None = None


# ===== Nested outputs (để frontend render dễ) =====
class AnswerWithTransitionsOut(AnswerOut):
    transitions: list[TransitionOut] = []

class QuestionWithAnswersOut(QuestionOut):
    answers: list[AnswerWithTransitionsOut] = []

class NodeWithQuestionsOut(ScenarioNodeOut):
    questions: list[QuestionWithAnswersOut] = []
