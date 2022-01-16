## Technologies
For this sample CRUD application, we'll use Python with [Flask](https://flask.palletsprojects.com/en/2.0.x/) for the webserver, with an SQLite database to keep setup simple.

## Getting started
This project was developed using Python 3.8.6 but similar versions of python should work as well. Once Python is installed, you can stall the dependency from `requirements.txt` using `pip install -r requirements.txt`.

## Rough Database Schema

Each inventory item should have
* SKU
* Quantity

Each item should also have
* SKU
* Friendly name
* Description

todo: 
- cannot update sku
- add warehouse support