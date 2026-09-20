"""Cloudflare Python Workers entry point for Aina FastAPI application."""

from workers import asgi
from aina.app import app

# Expose existing FastAPI application via Cloudflare Workers ASGI adapter
Default = asgi.entrypoint(app)
