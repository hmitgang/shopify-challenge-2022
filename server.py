from flask import Flask, render_template, request
from db import init_tables, get_db, close_db

init_tables()

app = Flask(__name__)
app.teardown_appcontext(close_db)

@app.route("/api/inventory/<sku>", methods=("DELETE", "PUT"))
def change_inventory(sku):
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
        print(request.json)
        if request.json.get("quantity"):
            db.execute("UPDATE inventory SET quantity=? WHERE sku = ?",
                (request.json.get("quantity"),sku))
        if request.json.get("name"):
            db.execute("UPDATE items SET name=? WHERE sku = ?",
                (request.json.get("name"),sku))
        if request.json.get("description"):
            db.execute("UPDATE items SET description=? WHERE sku = ?",
                (request.json.get("description"),sku))
        db.commit()
        return ""

@app.route("/api/inventory", methods=("GET", "POST"))
def inventory():
    if request.method == "POST":
        db = get_db()
        db.execute(
            "INSERT INTO items (sku, name, description) VALUES (?,?,?)", 
            (request.json.get("sku"), request.json.get("name"), request.json.get("description")))
        db.execute(
            "INSERT INTO inventory (sku, quantity) VALUES (?, ?)",
            (request.json.get("sku"), request.json.get("quantity")))
        db.commit()
        return "Success"
    if request.method == "GET":
        print(request.args)
        if "sku" in request.args:
            resp = get_db().execute("SELECT inventory.sku as sku, name, description, quantity FROM items JOIN inventory ON inventory.sku = items.sku WHERE items.sku=? AND name LIKE ?", 
                (request.args.get("sku"), request.args.get("name")+'%')).fetchall()
        else:
            resp = get_db().execute("SELECT inventory.sku as sku, name, description, quantity FROM items JOIN inventory ON inventory.sku = items.sku WHERE name LIKE ?", 
                ((request.args.get("name") or '')+'%',)).fetchall()

        return {"headers": ["sku", "name", "description", "quantity"], "inventory_items": resp}


    return "Success"

@app.route("/")
def main():
    return render_template("base.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8000', debug=True)