function findGetParameter(parameterName) {

    let result = null, tmp = [];
    location.search.substr(1).split("&").forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

async function loadDataJson(){

    return await fetch('resources/pokemons.json').then(response => response.json());
}

async function populateListTable(tablebody, creator, gen, official, filled, incomplete, missing){
    let gens = [["0001","2000"],
                ["0001","0151"],
                ["0152","0251"],
                ["0252","0386"],
                ["0387","0493"],
                ["0494","0649"],
                ["0650","0721"],
                ["0722","0809"],
                ["0810","2000"]]
                
    let dataJson = await loadDataJson()

    for (const entry in dataJson){

        if (entry == "0354"){
            let a = 22
        }
    
        if (entry < gens[gen][0] || entry > gens[gen][1]) continue;
        if (!missing && !!dataJson[entry]['forms']['0000']) continue;
        if (!filled && dataJson[entry]['complete'] == 2) continue;
        if (!incomplete && dataJson[entry]['complete'] == 1) continue;
        //if (creator && tracker[entry]["portrait_credit"] != creator) continue;

        let row = tablebody.insertRow();
        
        let pkdex = row.insertCell(0);
        pkdex.innerHTML = entry;
        
        let portrait = row.insertCell(1);
        
        let name = row.insertCell(2);
        name.innerHTML = dataJson[entry]['name'];

        let status = row.insertCell(3);
        let st, stn;
        if (Object.entries(dataJson[entry]['forms']).length == 0){
            st = "Missing";
            stn = 0;
        } else{
            if (dataJson[entry]['forms']['0000']['complete'] == 2){
                st = "Fully Featured";
                stn = 2;
            } else {
                st = "Exists";
                stn = 1;
            }
        } 

        status.innerHTML = st;
        status.attributes = "class=\"status-"+stn+"\""
        
        let link = row.insertCell(4);
        if (stn != 0){
            portrait.innerHTML = "<img src=\"resources/neutrals/"+entry+".png\"></img>"
            link.innerHTML = "<a href=\"portrait.html?id="+entry+"\">Portrait</a>";
        } else {
            portrait.innerHTML = "<img src=\"webassets/empty.png\"></img>"
            link.innerHTML = "";
        }
    }

}


















function chopImages(img,){

    let empty = new Image();
    img.src = "webassets/empty.png";

    for (i in 40){
        
    }
}