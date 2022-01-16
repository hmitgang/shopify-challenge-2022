import sqlite3
from flask import g

DB_NAME = "inventory.db"

def init_tables():
    con = sqlite3.connect(DB_NAME)

    con.cursor().execute("""
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT
    )""").execute("""
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT NOT NULL UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 0
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


    
