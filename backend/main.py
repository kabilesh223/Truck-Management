from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import io, os, json, shutil
from database import init_db, get_db_trips, save_db_trip, update_db_trip, delete_db_trip, get_settings, save_settings
from report import build_report

app = FastAPI(title="Truck Management API")

import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        os.environ.get("FRONTEND_URL", ""),   # set this on your server
        "*",                                   # remove this in production if you want strict CORS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# ── Models ────────────────────────────────────
class TripIn(BaseModel):
    date: str
    truck_no: str
    driver_name: str
    loading_point: str
    delivery_point: str
    weight: float = 0
    freight: float = 0
    toll: float = 0
    commission: float = 0
    fuel_liters: float = 0
    fuel_amount: float = 0
    expenses: float = 0
    advance: float = 0
    bill_amount: float = 0

class SettingsIn(BaseModel):
    company_name: str = "GOODS CARRIER"
    company_address: str = ""
    company_phone: str = ""
    trucks: list[str] = []
    drivers: list[str] = []

# ── Helpers ───────────────────────────────────
def calc_totals(d: TripIn):
    total_trip = d.toll + d.commission + d.fuel_amount + d.expenses + d.advance
    balance    = d.freight - total_trip - d.bill_amount
    return round(total_trip, 2), round(balance, 2)

# ── Trip Routes ───────────────────────────────
@app.get("/api/trips")
def list_trips(
    search: str = Query(""),
    truck: str  = Query("All"),
    driver: str = Query("All"),
    date_from: str = Query(""),
    date_to: str   = Query(""),
):
    trips = get_db_trips()
    result = []
    for t in trips:
        if search and not any(search.lower() in str(v).lower() for v in t.values() if v):
            continue
        if truck != "All" and t["truck_no"].upper() != truck.upper():
            continue
        if driver != "All" and t["driver_name"].lower() != driver.lower():
            continue
        if date_from and date_to:
            try:
                td = datetime.strptime(t["date"], "%d-%m-%Y").date()
                fd = datetime.strptime(date_from, "%Y-%m-%d").date()
                tod= datetime.strptime(date_to,   "%Y-%m-%d").date()
                if not (fd <= td <= tod):
                    continue
            except:
                pass
        result.append(t)
    total_freight = sum(float(t["freight"] or 0) for t in result)
    total_balance = sum(float(t["balance_amount"] or 0) for t in result)
    return {"trips": result, "total_freight": total_freight, "total_balance": total_balance}

@app.post("/api/trips", status_code=201)
def create_trip(trip: TripIn):
    total_trip, balance = calc_totals(trip)
    s = get_settings()
    if trip.truck_no and trip.truck_no not in s["trucks"]:
        s["trucks"].append(trip.truck_no)
        save_settings(s)
    if trip.driver_name and trip.driver_name not in s["drivers"]:
        s["drivers"].append(trip.driver_name)
        save_settings(s)
    trip_id = save_db_trip({**trip.model_dump(), "total_trip_amount": total_trip, "balance_amount": balance})
    return {"id": trip_id, "message": "Trip saved"}

@app.get("/api/trips/{trip_id}")
def get_trip(trip_id: int):
    trips = get_db_trips()
    t = next((x for x in trips if x["id"] == trip_id), None)
    if not t:
        raise HTTPException(404, "Trip not found")
    return t

@app.put("/api/trips/{trip_id}")
def update_trip(trip_id: int, trip: TripIn):
    total_trip, balance = calc_totals(trip)
    update_db_trip(trip_id, {**trip.model_dump(), "total_trip_amount": total_trip, "balance_amount": balance})
    return {"message": "Trip updated"}

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: int):
    delete_db_trip(trip_id)
    return {"message": "Trip deleted"}

# ── Dashboard ─────────────────────────────────
@app.get("/api/dashboard")
def dashboard():
    trips = get_db_trips()
    total_trips   = len(trips)
    total_freight = sum(float(t["freight"] or 0) for t in trips)
    total_balance = sum(float(t["balance_amount"] or 0) for t in trips)
    total_fuel    = sum(float(t["fuel_liters"] or 0) for t in trips)
    trucks_count  = len(set(t["truck_no"] for t in trips if t["truck_no"]))

    truck_freight = {}
    for t in trips:
        k = t["truck_no"] or "Unknown"
        truck_freight[k] = truck_freight.get(k, 0) + float(t["freight"] or 0)

    monthly = {}
    for t in trips:
        try:
            m = datetime.strptime(t["date"], "%d-%m-%Y").strftime("%b %Y")
            monthly[m] = monthly.get(m, 0) + 1
        except: pass

    driver_bal = {}
    for t in trips:
        k = t["driver_name"] or "Unknown"
        driver_bal[k] = driver_bal.get(k, 0) + float(t["balance_amount"] or 0)

    return {
        "total_trips": total_trips, "total_freight": total_freight,
        "total_balance": total_balance, "total_fuel": total_fuel,
        "trucks_count": trucks_count, "truck_freight": truck_freight,
        "monthly": monthly, "driver_bal": driver_bal
    }

# ── Settings ──────────────────────────────────
@app.get("/api/settings")
def get_settings_route():
    return get_settings()

@app.post("/api/settings")
def update_settings(s: SettingsIn):
    save_settings(s.model_dump())
    return {"message": "Settings saved"}

# ── Reports ───────────────────────────────────
@app.get("/api/report")
def download_report(
    report_type: str = Query("full"),
    truck: str  = Query("All"),
    driver: str = Query("All"),
    date_from: str = Query(""),
    date_to: str   = Query(""),
):
    trips = get_db_trips()
    filtered = []
    for t in trips:
        if truck != "All" and t["truck_no"].upper() != truck.upper(): continue
        if driver != "All" and t["driver_name"].lower() != driver.lower(): continue
        if date_from and date_to:
            try:
                td = datetime.strptime(t["date"], "%d-%m-%Y").date()
                fd = datetime.strptime(date_from, "%Y-%m-%d").date()
                tod= datetime.strptime(date_to,   "%Y-%m-%d").date()
                if not (fd <= td <= tod): continue
            except: pass
        filtered.append(t)

    settings = get_settings()
    wb = build_report(filtered, report_type, settings)
    buf = io.BytesIO()
    wb.save(buf); buf.seek(0)
    fname = f"report_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={fname}"})

# ── Backup ────────────────────────────────────
@app.post("/api/backup")
def backup():
    from database import DB_FILE, BACKUP_DIR
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = os.path.join(BACKUP_DIR, f"backup_{ts}.db")
    shutil.copy2(DB_FILE, dest)
    return {"message": f"Backup saved: backup_{ts}.db"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
