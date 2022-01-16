window.onload =  () => {
    let input_sku = document.getElementById("sku");
    let input_name = document.getElementById("name");
    let input_description = document.getElementById("description");
    let input_quantity = document.getElementById("quantity");
    let tbl = document.getElementById("results")

    let delete_func = function(sku) {
        return async () => {
            let resp = await fetch(`/api/inventory/${sku}`, {
                method: "DELETE"
            });
            if(resp.status == 200)
                document.getElementById(`sku_row_${sku}`).remove();
            else
                alert(`Failed to delete ${sku}`);
        }
    }

    let update_func = function(sku, headers) {
        return async () => {
            let values = {}
            let row = document.getElementById(`sku_row_${sku}`).children
            headers.forEach((header, idx) => {
                values[header] = header == "sku" ? sku : row[idx].firstElementChild.value
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
            row.forEach((cell, idx) => {
                let td = document.createElement('td');
                if(idx == sku_idx) {
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
            update_button.onclick = update_func(row[sku_idx], headers);
            
            td.append(update_button, delete_button);
            tr.append(td);

            tbl.append(tr);
        })

    }


    document.getElementById("find").addEventListener("click", ()=> {

        let params = {};
        if(input_sku.value) params["sku"] = input_sku.value;
        if(input_name.value) params["name"] = input_name.value;

        fetch("/api/inventory?" + new URLSearchParams(params)).then(handle_query);
    });

    document.getElementById("create").addEventListener("click", ()=> {
        if(!input_sku.value || !input_name.value) {
            return alert("Please include both sku and name");
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
                quantity: Number(input_quantity.value)
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