from typing import Generic, TypeVar, Any
from pydantic import BaseModel, ConfigDict
from fastapi.responses import JSONResponse

T = TypeVar("T")

class BaseResponseSchema(BaseModel, Generic[T]):
    status_code: int
    data: T | None = None
    message: str
    success: bool
    
    model_config = ConfigDict(from_attributes=True)

class ApiResponse:
    """Wrapper to standardize all JSON responses, mimicking the Node.js APIResponse behavior."""
    @staticmethod
    def success(data: Any = None, message: str = "Success", status_code: int = 200) -> JSONResponse:
        content = {
            "status_code": status_code,
            "data": data,
            "message": message,
            "success": True
        }
        return JSONResponse(status_code=status_code, content=content)

    @staticmethod
    def error(message: str = "Error", status_code: int = 400, errors: list = None) -> JSONResponse:
        content = {
            "status_code": status_code,
            "data": None,
            "message": message,
            "success": False,
            "errors": errors or []
        }
        return JSONResponse(status_code=status_code, content=content)
    
