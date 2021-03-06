from flask import Flask, render_template, request
from db import init_tables, get_db, close_db

init_tables() # Create required tables if they don't already exist

app = Flask(__name__)
app.teardown_appcontext(close_db) # close db connection after each request

@app.route("/api/inventory/<sku>", methods=("DELETE", "PUT"))
@app.route("/api/inventory", methods=("GET", "POST"))
def inventory(sku=None):
    if request.method == "POST":
        db = get_db()
        existing = db.execute("SELECT sku FROM items WHERE sku=? LIMIT 1", (request.json.get("sku"),)).fetchall()
        if len(existing) == 0: # sku doesnt yet exist. Create the item
            db.execute(
                "INSERT INTO items (sku, name, description) VALUES (?,?,?)", 
                (request.json.get("sku"), request.json.get("name"), request.json.get("description")))
        
        # Create inventory
        db.execute(
            "INSERT INTO inventory (sku, quantity, location_id) VALUES (?, ?, ?)",
            (request.json.get("sku"), request.json.get("quantity"),request.json.get("location_id"),))
        db.commit()
        return "Success" # In the future, we may want to return the newly created item
    
    if request.method == "GET":
        if "sku" in request.args:
            resp = get_db().execute("SELECT inventory.sku as sku, name, description, quantity, location_id FROM items JOIN inventory ON inventory.sku = items.sku WHERE items.sku=? AND name LIKE ? AND location_id LIKE ?", 
                (
                    request.args.get("sku"), 
                    (request.args.get("name") or '')+'%',
                    (request.args.get("location_id") or '%')
                )).fetchall()
        else:
            resp = get_db().execute("SELECT inventory.sku as sku, name, description, quantity, location_id FROM items JOIN inventory ON inventory.sku = items.sku WHERE name LIKE ? AND location_id LIKE ?", 
                (
                    (request.args.get("name") or '')+'%',
                    (request.args.get("location_id") or '%')
                )).fetchall()

        return {"headers": ["sku", "name", "description", "quantity", "location_id"], "inventory_items": resp}

    # For DELETE and PUT methods, we must have a sku
    if not sku:
        raise Exception()
    if request.method == "DELETE":
        db = get_db()
        db.execute("DELETE FROM inventory WHERE sku=?", (sku,))
        db.execute("DELETE FROM items WHERE sku=?", (sku,))
        db.commit()
        return ""
    if request.method == "PUT":
        db = get_db()
        if request.json.get("quantity"):
            db.execute("UPDATE inventory SET quantity=? WHERE sku = ? AND location_id = ?",
                (request.json.get("quantity"),sku,request.json.get("location_id")))
        if request.json.get("name"):
            db.execute("UPDATE items SET name=? WHERE sku = ?",
                (request.json.get("name"),sku))
        if request.json.get("description"):
            db.execute("UPDATE items SET description=? WHERE sku = ?",
                (request.json.get("description"),sku))
        db.commit()
        return ""

    raise Exception("Unreachable statement")


@app.route("/api/locations/<location_id>", methods=("DELETE",))
@app.route("/api/locations", methods=("GET", "POST"))
def locations(location_id=None):
    if request.method == "GET":
        resp = get_db().execute("SELECT id, name, country FROM locations").fetchall()
        return {"headers": ["id", "name", "country"], "locations": resp}

    if request.method == "POST":
        db = get_db()
        # We likely want to do more server side data validation
        db.execute(
            "INSERT INTO locations (name, country) VALUES (?,?)", 
            (request.json.get("name"), request.json.get("country")))
        db.commit()
        return "" # In the future, we may want to return the newly created location

    if request.method == "DELETE":
        db = get_db()
        db.execute("DELETE FROM locations WHERE id=?", (location_id,))
        db.commit()
        return ""

    raise Exception("Unreachable statement")


@app.route("/")
def main():
    return render_template("base.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8000', debug=False)