"""
与 Farmwatch `utils/response/api_response` 对齐的统一响应体：
  { "code": int, "message": str, "data": Any }

FastAPI 使用 JSONResponse；新接口可优先用本模块，既有 TLS 路由保持原样 dict 以免破坏调用方。
"""
from __future__ import annotations

from typing import Any

from starlette.responses import JSONResponse


def _body(code: int, message: str, data: Any = None) -> dict[str, Any]:
    return {"code": code, "message": message, "data": data}


def success(
    message: str = "OK",
    data: Any = None,
    code: int = 200,
) -> JSONResponse:
    return JSONResponse(content=_body(code, message, data), status_code=200)


def created(message: str = "Created", data: Any = None, code: int = 201) -> JSONResponse:
    return JSONResponse(content=_body(code, message, data), status_code=201)


def bad_request(message: str = "Bad request", data: Any = None, code: int = 400) -> JSONResponse:
    return JSONResponse(content=_body(code, message, data), status_code=400)


def error_not_found(message: str = "Not found", code: int = 404) -> JSONResponse:
    return JSONResponse(content=_body(code, message, None), status_code=404)


def error_server(message: str = "Internal server error", code: int = 500) -> JSONResponse:
    return JSONResponse(content=_body(code, message, None), status_code=500)


class ApiResponse:
    """与 Farmwatch 命名一致；委托到上方函数。"""

    @staticmethod
    def success(message: str = "OK", data: Any = None, code: int = 200) -> JSONResponse:
        return success(message=message, data=data, code=code)

    @staticmethod
    def error(
        message: str,
        code: int = 400,
        data: Any = None,
        http_status: int | None = None,
    ) -> JSONResponse:
        status = http_status if http_status is not None else 400
        return JSONResponse(content=_body(code, message, data), status_code=status)
