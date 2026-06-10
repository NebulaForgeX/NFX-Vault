# coding=utf-8
"""结构化日志 JSON 格式化（多行缩进，便于终端阅读）。"""
from __future__ import annotations

import json
from typing import Any


def format_log_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, indent=2, ensure_ascii=False, default=str)
