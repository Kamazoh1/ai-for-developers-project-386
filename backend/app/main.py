from fastapi import FastAPI

app = FastAPI(title="Call Calendar")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
