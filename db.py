import sqlite3
from flask import g

DB_NAME = "inventory.db"

def init_tables():
    con = sqlite3.connect(DB_NAME)

    cur = con.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL UNIQUE,
        name TEXT,
        description TEXT
    )""")
    
    # Note: when actually storing locations, we probably want to store much more
    #       address data, including city, postal code in some countries, street name,
    #       perhaps contact information/manager, or other pertant information. To
    #       keep things simple, we'll just use a friendly name and a country
    cur.execute("""
    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        country TEXT NOT NULL
    )""")

    cur.execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL,
        location_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY(sku) REFERENCES items(sku),
        FOREIGN KEY(location_id) REFERENCES locations(id),
        UNIQUE(sku, location_id)
    )""")
    
    con.commit()
    con.close()

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_NAME)
    
    return g.db

def close_db(e=None):
    print("closed db")
    db = g.pop('db', None)

    if db is not None:
        db.close()


    
