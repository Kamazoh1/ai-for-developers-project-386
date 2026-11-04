"""The API error model: every error response is ``{code, message, fields?}``.

``code`` is the stable machine value the UI turns into Russian text; ``message``
is short English for developers; ``fields`` is only sent with ``validation_error``.

Raise ``ApiError`` (or use the ``event_type_exists``-style subclasses added by
each feature) from anywhere in a request. ``install_error_handlers`` also turns
the framework's own request validation failures into ``validation_error``.
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.schemas import ApiModel


class FieldError(ApiModel):
    field: str
    message: str


class ErrorBody(ApiModel):
    code: str
    message: str
    fields: list[FieldError] | None = None


class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        fields: list[FieldError] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.body = ErrorBody(code=code, message=message, fields=fields)


def validation_error(fields: list[FieldError]) -> ApiError:
    return ApiError(422, "validation_error", "Request validation failed", fields)


def _respond(error: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code, content=error.body.model_dump(exclude_none=True)
    )


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    def handle_api_error(_request: Request, error: ApiError) -> JSONResponse:
        return _respond(error)

    @app.exception_handler(RequestValidationError)
    def handle_framework_validation(
        _request: Request, error: RequestValidationError
    ) -> JSONResponse:
        fields = [
            FieldError(field=_field_name(item["loc"]), message=item["msg"])
            for item in error.errors()
        ]
        return _respond(validation_error(fields))


def _field_name(loc: tuple[int | str, ...]) -> str:
    """The request field a pydantic error location points at: ``("body", "id")`` -> ``id``.

    Locations are rooted at the request part (body, query, path). An error about the
    whole part (malformed JSON, wrong top-level type) names that part, e.g. ``body``.
    """
    parts = [str(part) for part in loc[1:]]
    return ".".join(parts) if parts else str(loc[0])
