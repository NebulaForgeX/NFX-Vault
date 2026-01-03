# coding=utf-8

"""
Analysis Application Protocol

定义 AnalysisApplication 的接口协议，用于类型检查
避免循环导入问题
"""
from __future__ import annotations
from typing import Protocol


class AnalysisAppLike(Protocol):
    """AnalysisApplication 接口协议"""
    pass

