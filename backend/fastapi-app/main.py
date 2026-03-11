from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "MSU Surplus Tracker API running"}