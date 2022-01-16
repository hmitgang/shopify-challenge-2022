window.onload =  () => {
    let input_sku = document.getElementById("sku");
    let input_name = document.getElementById("name");
    let input_description = document.getElementById("description");
    let input_quantity = document.getElementById("quantity");
    let input_location = document.getElementById("location");
    let input_location_name = document.getElementById("location_name");
    let input_location_country = document.getElementById("location_country");
    let tbl = document.getElementById("results")

    let delete_func = function(sku) {
        return async () => {
            if(!confirm("Deleting this sku will delete it from all locations.")) return;
            let resp = await fetch(`/api/inventory/${sku}`, {
                method: "DELETE"
            });
            if(resp.status == 200)
                while(document.getElementById(`sku_row_${sku}`))
                    document.getElementById(`sku_row_${sku}`).remove();
            else
                alert(`Failed to delete ${sku}`);
        }
    }

    // TODO: add update for location
    let update_func = function(sku, headers, location_id) {
        return async () => {
            let values = {}
            let row = document.querySelector(`#sku_row_${sku}.location_${location_id}`).children
            headers.forEach((header, idx) => {
                if(header == "sku") {
                    values[header] = sku;    
                } else if (header=="location") {
                    values["location_id"] = location_id;
                } else {
                    values[header] = row[idx].firstElementChild.value;
                }
            });
            let resp = await fetch(`/api/inventory/${sku}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            if(resp.status !== 200)
                alert(`Failed to update ${sku}`);
        }
    }


    let handle_query = async (data) => {
        tbl.innerHTML = "";
        let {headers, inventory_items} = await data.json();
        let sku_idx = headers.indexOf("sku");
        let quantity_idx = headers.indexOf("quantity");
        let location_idx = headers.indexOf("location_id");
        headers[location_idx] = "location";

        // Create headers
        let thead = document.createElement("tr");
        [...headers, "Actions"].forEach((title) => {
            let th = document.createElement("th");
            th.innerText = title;
            thead.append(th);
        })
        tbl.append(thead);

        inventory_items.forEach((row) => {
            let tr = document.createElement("tr");
            tr.id = "sku_row_"+row[sku_idx];
            tr.className = "location_"+row[location_idx];
            row.forEach((cell, idx) => {
                let td = document.createElement('td');
                if(idx == sku_idx) {
                    td.innerText = cell;
                } else if(idx == location_idx) {
                    // Todo: convert this to a friendly name
                    td.innerText = cell;
                } else {
                    let input = document.createElement("input");
                    if(idx == quantity_idx) input.type = "number";
                    input.value = cell;
                    td.append(input);
                }
                
                tr.append(td);
            });
            let td = document.createElement("td");
            let delete_button = document.createElement("button");
            delete_button.innerText = "Delete";
            delete_button.onclick = delete_func(row[sku_idx]);
            

            let update_button = document.createElement("button");
            update_button.innerText = "Update";
            update_button.onclick = update_func(row[sku_idx], headers, row[location_idx]);
            
            td.append(update_button, delete_button);
            tr.append(td);

            tbl.append(tr);
        })

    }


    

    function getLocations() {
        fetch("/api/locations").then((data) => data.json()).then(json => {
            input_location.innerHTML = "<option value>--</option>";
            json["locations"].forEach((data) => {
                loc = {}
                data.forEach(
                    (value, idx) => loc[json["headers"][idx]] = value
                )
                let newOption = document.createElement("option");
                newOption.innerText = `${loc["id"]}: ${loc["name"]}, ${loc["country"].toUpperCase()}`;
                newOption.setAttribute("value", loc["id"]);
                input_location.appendChild(newOption);
            });
        })
    }

    document.getElementById("location_create").addEventListener("click", () => {
        if(!input_location_name.value || !input_location_country.value) {
            return alert("Please include both a name and country.")
        }

        fetch("/api/locations", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: input_location_name.value,
                country: input_location_country.value
            })
        }).then(getLocations);
    });

    document.getElementById("location_retrieve_locations").addEventListener("click", getLocations);
    getLocations(); // Do it once on page load

    document.getElementById("delete_location").addEventListener("click", async () => {
        if(input_location.value === '') {
            return alert("Please select a location to delete");
        }
        
        let resp = await fetch(`/api/locations/${input_location.value}`, {
            method: "DELETE"
        });
        if(resp.status == 200)
            getLocations();
        else
            alert(`Failed to delete ${location}`);
    });

    document.getElementById("find").addEventListener("click", () => {

        let params = {};
        if(input_sku.value) params["sku"] = input_sku.value;
        if(input_name.value) params["name"] = input_name.value;

        fetch("/api/inventory?" + new URLSearchParams(params)).then(handle_query);
    });

    document.getElementById("create").addEventListener("click", ()=> {
        if(!input_sku.value || !input_location.value) {
            return alert("Please include both sku and location");
        }

        fetch("/api/inventory", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sku: input_sku.value,
                name: input_name.value,
                description: input_description.value,
                quantity: Number(input_quantity.value),
                location_id: input_location.value
            })
        }).then((response) => {
            console.log(response);
        });
    });

    document.getElementById("clear").addEventListener("click", ()=> {
        input_sku.value = "";
        input_name.value = "";
        input_description.value = "";
        input_quantity.value = "";
    });

}