from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import Settings
from extensions import engine, SessionLocal
import uvicorn

from router.user_router import user_router
#from router.auth_router import auth_router
#from router.message_user_router import message_user_router
#from router.message_ai_router import message_ai_router
#from router.chat_router import chat_router
#from router.rating_router import rating_router
#from router.contract_router import contract_router
#from router.dashboard_router import dashboard_router
#from router.admin_router import admin_router

settings = Settings

app = FastAPI(title="SentryAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_router)
#app.include_router(auth_router)
#app.include_router(message_user_router)
#app.include_router(message_ai_router)
#app.include_router(chat_router)
#app.include_router(rating_router)
#app.include_router(contract_router)
#app.include_router(dashboard_router)
#app.include_router(admin_router)


@app.get("/", tags=["health"])
def index():
    return {"message": "API is running"}


# If you want to run with `python main.py`
if __name__ == "__main__":
    uvicorn.run("app:app", port=5000, reload=settings.DEBUG)
