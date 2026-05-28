import sqlite3, os, json

BASE_DIR   = os.path.dirname(__file__)
DATA_DIR   = os.path.join(BASE_DIR, "data")
DB_FILE    = os.path.join(DATA_DIR, "truck.db")
BACKUP_DIR = os.path.join(DATA_DIR, "backups")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")

os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_SETTINGS = {
    "company_name": "GOODS CARRIER",
    "company_address": "",
    "company_phone": "",
    "trucks": [],
    "drivers": []
}

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS trips (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            date             TEXT,
            truck_no         TEXT,
            driver_name      TEXT,
            loading_point    TEXT,
            delivery_point   TEXT,
            weight           REAL DEFAULT 0,
            freight          REAL DEFAULT 0,
            toll             REAL DEFAULT 0,
            commission       REAL DEFAULT 0,
            fuel_liters      REAL DEFAULT 0,
            fuel_amount      REAL DEFAULT 0,
            expenses         REAL DEFAULT 0,
            advance          REAL DEFAULT 0,
            bill_amount      REAL DEFAULT 0,
            total_trip_amount REAL DEFAULT 0,
            balance_amount   REAL DEFAULT 0,
            created_at       TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()

def row_to_dict(row):
    return dict(row)

def get_db_trips():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM trips ORDER BY id").fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]

def save_db_trip(data):
    conn = get_conn()
    cur = conn.execute("""
        INSERT INTO trips (date,truck_no,driver_name,loading_point,delivery_point,
            weight,freight,toll,commission,fuel_liters,fuel_amount,expenses,advance,
            bill_amount,total_trip_amount,balance_amount)
        VALUES (:date,:truck_no,:driver_name,:loading_point,:delivery_point,
            :weight,:freight,:toll,:commission,:fuel_liters,:fuel_amount,:expenses,:advance,
            :bill_amount,:total_trip_amount,:balance_amount)
    """, data)
    conn.commit()
    trip_id = cur.lastrowid
    conn.close()
    return trip_id

def update_db_trip(trip_id, data):
    conn = get_conn()
    conn.execute("""
        UPDATE trips SET date=:date,truck_no=:truck_no,driver_name=:driver_name,
            loading_point=:loading_point,delivery_point=:delivery_point,
            weight=:weight,freight=:freight,toll=:toll,commission=:commission,
            fuel_liters=:fuel_liters,fuel_amount=:fuel_amount,expenses=:expenses,
            advance=:advance,bill_amount=:bill_amount,
            total_trip_amount=:total_trip_amount,balance_amount=:balance_amount
        WHERE id=:id
    """, {**data, "id": trip_id})
    conn.commit()
    conn.close()

def delete_db_trip(trip_id):
    conn = get_conn()
    conn.execute("DELETE FROM trips WHERE id=?", (trip_id,))
    conn.commit()
    conn.close()

def get_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE) as f:
                s = json.load(f)
            for k, v in DEFAULT_SETTINGS.items():
                s.setdefault(k, v)
            return s
        except: pass
    return dict(DEFAULT_SETTINGS)

def save_settings(settings):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=2)
