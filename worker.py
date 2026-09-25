"""Cloudflare Python Workers entry point for Aina FastAPI application."""

from workers import WorkerEntrypoint, asgi
from aina.app import app, configure_app


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        if hasattr(self, "env") and self.env is not None:
            configure_app(self.env)
        return await asgi.fetch(app, request, self.env)
