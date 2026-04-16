import os
import re

try:
    from twilio.rest import Client as TwilioClient
    from twilio.base.exceptions import TwilioRestException
except ImportError:
    TwilioClient = None
    TwilioRestException = None


def sanitize_twilio_message(message: str) -> str:
    return re.sub(r"\x1b\[[0-9;]*m", "", message).strip()


def normalize_phone_number(phone: str) -> str:
    cleaned = re.sub(r"[^0-9+]", "", phone or "")
    if cleaned.startswith("+"):
        return cleaned
    if cleaned:
        return f"+{cleaned}"
    return cleaned


class TwilioConfigurationError(Exception):
    pass


def get_twilio_config() -> dict[str, str]:
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = os.environ.get("TWILIO_FROM_PHONE")

    if not account_sid or not auth_token or not from_number:
        raise TwilioConfigurationError(
            "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_PHONE."
        )

    if TwilioClient is None:
        raise TwilioConfigurationError("Twilio package is not installed.")

    return {
        "account_sid": account_sid,
        "auth_token": auth_token,
        "from_number": from_number,
    }


def build_sos_message(contact_name: str, hospital_name: str, hospital_location: str, user_location: str, user_coordinates: str) -> str:
    return (
        f"🚨 Emergency! I am at {user_location} ({user_coordinates}). "
        f"Heading to {hospital_name} in {hospital_location}. Please help. "
        f"Contact: {contact_name}."
    )


def send_emergency_sms(contact_phone: str, contact_name: str, hospital_name: str, hospital_location: str, user_location: str, user_coordinates: str) -> dict:
    config = get_twilio_config()
    client = TwilioClient(config["account_sid"], config["auth_token"])

    from_number = normalize_phone_number(config["from_number"])
    to_number = normalize_phone_number(contact_phone)

    body = build_sos_message(contact_name, hospital_name, hospital_location, user_location, user_coordinates)

    try:
        message = client.messages.create(
            body=body,
            from_=from_number,
            to=to_number,
        )

        return {"sid": message.sid, "status": message.status}
    except Exception as exc:
        if TwilioRestException is not None and isinstance(exc, TwilioRestException):
            detail = sanitize_twilio_message(str(exc))
            if "21606" in detail or "not a valid message-capable Twilio phone number" in detail:
                detail = (
                    "Twilio error 21606: your From number is not SMS-capable for this destination. "
                    "Use a Twilio SMS-enabled number or messaging service that supports the recipient country."
                )
            raise ValueError(detail) from exc
        raise
