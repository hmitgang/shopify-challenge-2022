## Technologies
For this sample CRUD application, we'll use Python with [Flask](https://flask.palletsprojects.com/en/2.0.x/) for the webserver, with an SQLite database to keep setup simple.

## Getting started
This project was developed using Python 3.8.6 but similar versions of python should work as well. Once Python is installed, you can install the dependencies from `requirements.txt` using `pip install -r requirements.txt`. Run the webserver using `python3 server.py` and navigate to [localhost:8000](http://localhost:8000).

## Rough Database Schema

Each inventory item should have
* SKU
* Warehouse location id
* Quantity

Each item should also have
* SKU
* Friendly name
* Description

Each warehouse location should have
* id
* Name
* Country
<details><summary>A note about locations</summary>
When actually storing locations, we probably want to store much more
address data, including city, postal code in some countries, street name,
perhaps contact information/manager, or other pertinent information. To
keep things simple, we'll just use a friendly name and a country    
</details>

## Some things to improve on
* Better error handling. Right now we just return an error 500 on invalid input, and don't even show an error message to the frontend user. This greatly impacts ease of use.
* We would want to do more server side data validation before completing requests, rather than just waiting for SQLite to raise an exception.