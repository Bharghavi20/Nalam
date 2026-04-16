from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal

from .sms_sender import TwilioConfigurationError, send_emergency_sms

# Load local environment variables for backend development
env_root = Path(__file__).resolve().parents[1]
for env_file in [env_root / ".env.local", env_root / ".env", Path(__file__).resolve().parent / ".env"]:
    if env_file.exists():
        load_dotenv(env_file)

app = FastAPI(title="Nalam Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)


class HospitalPayload(BaseModel):
    id: str
    name: str
    location: str
    distance: float
    available_beds: int
    icu_beds: int
    available_icu: int
    load_percentage: int
    specialization: List[str]


class RecommendRequest(BaseModel):
    location: str
    condition_type: Literal["Accident", "Cardiac", "General", "Neuro"]
    severity: Literal["Low", "Medium", "Critical"]
    hospitals: List[HospitalPayload]


class RecommendResponse(BaseModel):
    hospital_id: str
    hospital_name: str
    distance: float
    available_beds: int
    available_icu: int
    load_percentage: int
    explanation: str
    score: float


def score_hospital(hospital: HospitalPayload, severity: str, condition_type: str) -> float:
    if hospital.available_beds <= 0:
        return -999

    load_score = max(0, 100 - hospital.load_percentage) * 1.5
    distance_score = max(0, 120 - hospital.distance * 6)
    bed_score = hospital.available_beds * 10
    icu_score = hospital.available_icu * 15

    severity_multiplier = 1.0
    if severity == "Critical":
        severity_multiplier = 1.4
    elif severity == "Medium":
        severity_multiplier = 1.1

    specialization_bonus = 0
    if condition_type.lower() in [spec.lower() for spec in hospital.specialization]:
        specialization_bonus = 40

    if severity == "Critical" and hospital.available_icu <= 0:
        return -999

    score = (load_score + distance_score + bed_score + icu_score + specialization_bonus) * severity_multiplier
    return float(score)


@app.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    if not request.hospitals:
        raise HTTPException(status_code=400, detail="No hospital data supplied.")

    best = None
    best_score = -1e9
    for hospital in request.hospitals:
        current_score = score_hospital(hospital, request.severity, request.condition_type)
        if current_score > best_score:
            best_score = current_score
            best = hospital

    if best is None:
        raise HTTPException(status_code=404, detail="No suitable hospital found.")

    explanation_parts = [
        f"Selected because it has {best.available_beds} available beds",
        f"and {best.available_icu} ICU beds",
        f"with a current load of {best.load_percentage}%.",
    ]

    if request.condition_type.lower() in [spec.lower() for spec in best.specialization]:
        explanation_parts.append("It also matches the patient condition specialization.")

    if request.severity == "Critical":
        explanation_parts.append("Critical severity needs ICU-capable care, so ICU capacity was weighted higher.")

    return RecommendResponse(
        hospital_id=best.id,
        hospital_name=best.name,
        distance=best.distance,
        available_beds=best.available_beds,
        available_icu=best.available_icu,
        load_percentage=best.load_percentage,
        explanation=" ".join(explanation_parts),
        score=round(best_score, 2),
    )


class SOSRequest(BaseModel):
    contact_name: str
    contact_phone: str
    hospital_name: str
    hospital_location: str
    user_location: str
    user_coordinates: str


@app.post("/sos")
async def send_sos(request: SOSRequest):
    try:
        return send_emergency_sms(
            contact_phone=request.contact_phone,
            contact_name=request.contact_name,
            hospital_name=request.hospital_name,
            hospital_location=request.hospital_location,
            user_location=request.user_location,
            user_coordinates=request.user_coordinates,
        )
    except TwilioConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
