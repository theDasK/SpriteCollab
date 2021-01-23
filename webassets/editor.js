posibleNames = ["Walk","Attack","Strike","Shoot","Strike","Sleep","Hurt","Idle","Swing","Double","Hop","Charge","Rotate","EventSleep","Wake","Eat","Tumble","Pose","Pull","Pain","Float","DeepBreath","Nod","Sit","LookUp","Sink","Trip","Laying","LeapForth","Head","Cringe","LostBalance","TumbleBack","Faint","HitGround","Special1"];

function cloneObj (obj){ //Ok, js, are you OOP or not?

    return JSON.parse(JSON.stringify(obj));
}

//################ File Operataions
async function loadFromZip(file){
    wPMDSprite = await createPMDSpriteFromZip(await loadZip(file));

    fillSelect();
    fillFrameHolder();
}

//
async function loadZip(content){
    
    result = await JSZip.loadAsync(content);
    return result;
}

function importSpriteSheet(element){

    if (element.files[0].type == "image/png"){
        
        loadSpritesheet(element.files[0]);
    } else {
        addWarning(1,"load","Spritesheet is not in PNG format");
    }
    element.value = "";
}

async function loadSpritesheet(file){

    let content = await getImgfromFile(file);
    let proceed;
    let sizecheck = wPMDSprite.anims[dAnim].frameWidth * wPMDSprite.anims[dAnim].frames[0].length == content.width &&
    wPMDSprite.anims[dAnim].frameHeight * wPMDSprite.anims[dAnim].frames.length == content.height;

    if (sizecheck){
        proceed = confirm("Are you sure you want to load a new spritesheet?");
    } else{
        proceed = confirm("Are you sure you want to load a new spritesheet? The size of files doesnt match, there might be missing frames. Try adjusting animtions frame size before importing");
        addWarning(0,"load","Spritesheet is not the right size");
    }

    if (!proceed) return;

    frames = await parseFramesfromIMG(wPMDSprite.anims[dAnim].frameWidth, wPMDSprite.anims[dAnim].frameHeight, content);
    for (let j = 0; j < wPMDSprite.anims[dAnim].frames.length; j++){
        if (frames[j] === undefined) continue;
        for (let i = 0; i < wPMDSprite.anims[dAnim].frames[0].length; i++){
            if (frames[j][i] === undefined) continue;
            wPMDSprite.anims[dAnim].frames[j][i].sprite = frames[j][i];
        }
    }
}

function downloadSprites(){

    let temp = generateSpriteSheet()

    var downloadLink = document.createElement("a");
    downloadLink.href = temp.toDataURL("image/png");
    downloadLink.download = dAnim + "-Anim.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadHelper(){
    let temp = document.createElement("canvas").getContext("2d");
    let colors =["#484848","#A9A9A9"];
    let borders = false, eol = false;
    let fw = wPMDSprite.anims[dAnim].frameWidth;
    let fh = wPMDSprite.anims[dAnim].frameHeight;
    let x = wPMDSprite.anims[dAnim].frames[0].length;
    let y = wPMDSprite.anims[dAnim].frames.length;

    temp.canvas.width = fw * x;
    temp.canvas.height = fh * y;

    for (let j = 0; j < y; j++){
        eol = borders;
        for (let i = 0; i < x; i++){

            temp.fillStyle = borders ? colors[0] : colors[1];
            temp.fillRect(fw*i, fh*j, fw, fh);
            temp.clearRect(fw*i+2, fh*j+2, fw-4, fh-4);
            temp.fillStyle = !borders ? colors[0] : colors[1];
            temp.fillRect(fw*i+Math.trunc(fw/2)-1, fh*j+Math.trunc(fh/2)-1, 2, 2);
            borders = !borders
        }
        borders = !eol;
    }

    var downloadLink = document.createElement("a");
    downloadLink.href = temp.canvas.toDataURL("image/png");
    downloadLink.download = dAnim + "-Helper.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadShadow(){

    temp = generateShadowsSheet();

    var downloadLink = document.createElement("a");
    downloadLink.href = temp.toDataURL("image/png");
    downloadLink.download = dAnim + "-Shadow.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadOffsets(){

    let temp = generateOffsetsSheet();

    let downloadLink = document.createElement("a");
    downloadLink.href = temp.toDataURL("image/png");
    downloadLink.download = dAnim + "-Offsets.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

async function getImgfromB64(filebase64){

    return new Promise((resolve, reject) => {
        let img = new Image();

        img.onload = function(){
            resolve(img);
        };

        img.onerror = reject; 
        img.src = "data:image/png;base64," + filebase64;
    })
}

function downloadXML(){ //ok, im having poblems creating a real xml and Im a bit drunk... sue me

    let xml = generateXML();

    var downloadLink = document.createElement("a");
    downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(xml);
    downloadLink.download = "AnimData.xml";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

async function downloadZip(){
    let zip = new JSZip();

    zip.file("AnimData.xml",generateXML());

    for (i in wPMDSprite.anims){
        if (wPMDSprite.anims[i].copyOf) continue;

        let name = wPMDSprite.anims[i].name;

        let blob = await getCanvasBlob(generateSpriteSheet(i))
        zip.file(name+"-Anim.png", blob);
        blob = await getCanvasBlob(generateShadowsSheet(i))
        zip.file(name+"-Shadow.png", blob);
        blob = await getCanvasBlob(generateOffsetsSheet(i))
        zip.file(name+"-Offsets.png", blob);
    }

    zip.generateAsync({type: "base64"}).then(function(content) {
        var link = document.createElement('a');
        link.href = "data:application/zip;base64," + content;
        link.download = "PMDSprite.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

async function getCanvasBlob(canvas){
    return new Promise(function(resolve, reject) {
        canvas.toBlob(function (blob) {
            resolve(blob);
        });
    });
}

//This loads an image from a file object
async function getImgfromFile(file){

    return new Promise((resolve, reject) => {
        let img = new Image();

        img.onload = function(){
            resolve(img);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    })
}

//This will parse and sanity check the xml
function parseAnimData (xmldata){

    let data = [];

    try {
        let parser = new DOMParser();
        let xml = parser.parseFromString(xmldata,"text/xml");

        data[0] = parseInt(xml.getElementsByTagName("ShadowSize")[0].innerHTML);
        data[1] = [];

        let animTags = xml.getElementsByTagName("Anim");
        for (let i = 0; i < animTags.length; i++) {

            let anims = Array(9).fill(null);
            anims[8] = [];

            anims[0] = animTags[i].getElementsByTagName("Name")[0].innerHTML;
            if (animTags[i].getElementsByTagName('Index')[0]) anims[1] = parseInt(animTags[i].getElementsByTagName("Index")[0].innerHTML);
            if (animTags[i].getElementsByTagName("CopyOf")[0]){
                anims[2] = animTags[i].getElementsByTagName("CopyOf")[0].innerHTML;
                data[1].push(anims)
                continue;
            }

            anims[3] = parseInt(animTags[i].getElementsByTagName("FrameWidth")[0].innerHTML);
            anims[4] = parseInt(animTags[i].getElementsByTagName("FrameHeight")[0].innerHTML);
            if (animTags[i].getElementsByTagName('RushFrame')[0]) anims[5] = parseInt(animTags[i].getElementsByTagName("RushFrame")[0].innerHTML);
            if (animTags[i].getElementsByTagName('HitFrame')[0]) anims[6] = parseInt(animTags[i].getElementsByTagName("HitFrame")[0].innerHTML);
            if (animTags[i].getElementsByTagName('ReturnFrame')[0]) anims[7] = parseInt(animTags[i].getElementsByTagName("ReturnFrame")[0].innerHTML);
            
            let durations = animTags[i].getElementsByTagName("Durations")[0].children;
            for (let j = 0; j < durations.length; j++){

                anims[8].push(parseInt(durations[j].innerHTML));
            }

            data[1].push(anims);
        }
    } catch {

        return false;
    }

    return data;
}

//returns array of canvases from a file inside the zip
async function parseFramesFromZip(name, fwidth, fheight, zip){

    if (name + "-Anim.png" in zip.files){
        let b64 = await zip.file(name + "-Anim.png").async("base64")
        let img = await getImgfromB64(b64);

        return await parseFramesfromIMG(fwidth, fheight,img);
    }else {
        return null;
    }
}

async function parseFramesfromIMG(fwidth, fheight, img){
    let directions = [];

    for (let j = 0; j < img.height; j += fheight){
        let frames = [];

        for (let i = 0; i < img.width; i += fwidth){

            let tempframe = document.createElement("canvas").getContext("2d");
            tempframe.canvas.width = fwidth;
            tempframe.canvas.height = fheight;

            tempframe.drawImage(img, i , j, fwidth, fheight, 0, 0, fwidth, fheight);

            frames.push(tempframe.canvas);
        }
        directions.push(frames);
    }
    return directions;
}

//returns an array of shadows coords from a file
async function parseShadowsFromZip(name, fwidth, fheight, zip){

    if (name + "-Shadow.png" in zip.files){         //check if the file exists

        let b64 = await zip.file(name + "-Shadow.png").async("base64")
        let img = await getImgfromB64(b64);
        let tempctx = document.createElement("canvas").getContext("2d");
        tempctx.canvas.width = img.width;
        tempctx.canvas.height = img.height;
        tempctx.drawImage(img, 0, 0);
        let directions = [];

        for (let j = 0; j < img.height; j += fheight){
            let frames = [];

            for (let i = 0; i < img.width; i += fwidth){
                data = tempctx.getImageData(i , j, fwidth, fheight);
                coord = [];

                for (let k = 0; k < data.data.length; k += 4){

                    if (data.data[k] == 255 && data.data[k+1] == 255 && data.data[k+2] == 255 && data.data[k+3] == 255){
            
                        if (coord.length == 0){    //check if theres not a shadow already
            
                            coord = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning(0, "shadow", "Multiple shadows found on a frame in " + name + "-Shadow.png. Using First.");
                        }
                    }
                }
                if (coord.length == 0){             //check if theres at least a shadow

                    coord = [[Math.trunc(fwidth/2), Math.trunc(fheight/2)], 1];
                } else {
                    addWarning(0, "shadow", "A frame in " + name + "-Shadow.png is missing a shadow. Generated one.");
                }
                frames.push(coord);
            }
            directions.push(frames);
        }
        return directions;
    } else {
        return null;
    }
}

//returns an array of array with offset from a file
async function parseOffsetsFromZip(name, fwidth, fheight, zip){

    if (name + "-Offsets.png" in zip.files){         //check if the file exists

        let b64 = await zip.file(name + "-Offsets.png").async("base64")
        let img = await getImgfromB64(b64);
        let tempctx = document.createElement("canvas").getContext("2d");
        tempctx.canvas.width = img.width;
        tempctx.canvas.height = img.height;
        tempctx.drawImage(img, 0, 0);
        let directions = [];

        for (let j = 0; j < img.height; j += fheight){
            let frames = [];

            for (let i = 0; i < img.width; i += fwidth){
                data = tempctx.getImageData(i , j, fwidth, fheight);
                let coords = [null,null,null,null];

                for (let k = 0; k < data.data.length; k += 4){

                    if (data.data[k] == 0 && data.data[k+1] == 0 && data.data[k+2] == 0 && data.data[k+3] == 255){
                        if (!coords[3]){
            
                            coords[3] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning(0, "offsets", "Multiple red offsets found on a frame in " + name + "-Offsets.png. Using First.");
                        }
                        continue;
                    }
                    if (data.data[k] == 255){
                        if (!coords[0]){             //check if theres not a offsets already
            
                            coords[0] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning(0, "offsets", "Multiple green offsets found on a frame in " + name + "-Offsets.png. Using First.");
                        }
                    }
                    if (data.data[k+1] == 255){
                        if (!coords[1]){
            
                            coords[1] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning(0, "offsets", "Multiple blue offsets found on a frame in " + name + "-Offsets.png. Using First.");
                        }
                    }
                    if (data.data[k+2] == 255){
                        if (!coords[2]){
            
                            coords[2] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning(0, "offsets", "Multiple black offsets found on a frame in " + name + "-Offsets.png. Using First.");
                        }
                    }
                }
                for (let i in Array(3).keys()){
                    if (!coords[i]){             //if theres at least a single offset of each type            

                        coords[i] = [Math.trunc(fwidth/2), Math.trunc(fheight/2)];
                        addWarning(0, "offsets", "A frame in " + name + "-Offsets.png is missing an offset. Generating one.");
                    }
                }
                if (!coords[3]){                 //Lets not put the head pointer with other, as this one cant overlap;

                    coords[3] = [Math.trunc(fwidth/2), Math.trunc(fheight/2)-1];
                    addWarning(0, "offsets", "A frame in " + name + "-Offsets.png is missing a the head offset. Generating one.");
                }
                frames.push(coords);
            }
            directions.push(frames);
        }
        return directions;
    }else {
        return null;
    }
}

//returns an array that contains the row/col of: Highest, Lower, rightmost, leftmoss pixel
function findBorders(img){
    let tempx = [], tempy = [];

    let tempctx = document.createElement("canvas").getContext("2d");
    tempctx.canvas.width = img.width;
    tempctx.canvas.height = img.height;
    tempctx.drawImage(img, 0, 0);

    data = tempctx.getImageData(0 , 0, img.width, img.height);

    for (let k = 0; k < data.data.length; k += 4){

        if (data.data[k+3] == 255){

            tempx.push((k/4) % img.width);
            tempy.push(Math.trunc((k/4)/img.width));
        }
    }

    if (tempx == []){
        return [null, null, null, null]
    }

    return [tempy[0], tempy[tempy.length-1] + 1, Math.min(...tempx), Math.max(...tempx) + 1];
}

function generateEmptyFrames (fwidth, fheight, n, d){

    let direction = [];
    for (let j = 0; j < d; j++){
        let empty = [];
        for (let i = 0; i < n; i++){
            let tempctx = document.createElement("canvas").getContext("2d");
            tempctx.canvas.width = fwidth;
            tempctx.canvas.height = fheight;

            empty.push(tempctx.canvas);
        }
        direction.push(empty);
    }
    return direction;
}

function generateEmptyShadows (fwidth, fheight, n, d){

    let direction = [];
    for (let j = 0; j < d; j++){
        let empty = [];
        for (let i = 0; i < n; i++){

            empty.push([Math.trunc(fwidth/2), Math.trunc(fheight/2)]);
        }
        direction.push(empty);
    }
    return direction;
}

function generateEmptyOffsets (fwidth, fheight, n, d){

    let direction = [];
    for (let j = 0; j < d; j++){
        let empty = [];
        for (let i = 0; i < n; i++){

            let precal = [Math.trunc(fwidth/2), Math.trunc(fheight/2)];

            empty.push([precal,precal,precal,[precal[0],precal[1]+1]]);
        }
        direction.push(empty);
    }
    return direction;
}

function generateSpriteSheet(anim = dAnim){
    let temp = document.createElement("canvas").getContext("2d");
    let w = wPMDSprite.anims[anim].frameWidth;
    let h = wPMDSprite.anims[anim].frameHeight;
    let fn = wPMDSprite.anims[anim].frames[0].length;
    let fd = wPMDSprite.anims[anim].frames.length;
    temp.canvas.width =  w * fn;
    temp.canvas.height = h * fd;

    for(let j = 0; j < fd; j++){
        for(let i = 0; i < fn; i++){
            temp.drawImage(wPMDSprite.anims[anim].frames[j][i].sprite,
                wPMDSprite.anims[anim].frames[j][i].spriteoffset[0] + i * w,
                wPMDSprite.anims[anim].frames[j][i].spriteoffset[1] + j * h, w, h);
        }
    }
    return temp.canvas;
}

function generateShadowsSheet(anim = dAnim){
    let temp = document.createElement("canvas").getContext("2d");
    let w = wPMDSprite.anims[anim].frameWidth;
    let h = wPMDSprite.anims[anim].frameHeight;
    let fn = wPMDSprite.anims[anim].frames[0].length;
    let fd = wPMDSprite.anims[anim].frames.length;
    temp.canvas.width =  w * fn;
    temp.canvas.height = h * fd;

    for(let j = 0; j < fd; j++){
        for(let i = 0; i < fn; i++){
                temp.drawImage(imgShadows, 1, 161, 22, 8,
                    i * w + wPMDSprite.anims[anim].frames[j][i].shadow[0] - 12,
                    j * h + wPMDSprite.anims[anim].frames[j][i].shadow[1] - 5, 22, 8);
        }
    }
    return temp.canvas;
}

function generateOffsetsSheet(anim = dAnim){
    let temp = document.createElement("canvas").getContext("2d");
    let w = wPMDSprite.anims[anim].frameWidth;
    let h = wPMDSprite.anims[anim].frameHeight;
    let fn = wPMDSprite.anims[anim].frames[0].length;
    let fd = wPMDSprite.anims[anim].frames.length;
    temp.canvas.width =  w * fn;
    temp.canvas.height = h * fd;

    for(let j = 0; j < fd; j++){
        for(let i = 0; i < fn; i++){
            let offsetsr = wPMDSprite.anims[anim].frames[j][i].offsetsr;
            let offsetsg = wPMDSprite.anims[anim].frames[j][i].offsetsg;
            let offsetsb = wPMDSprite.anims[anim].frames[j][i].offsetsb;

            temp.fillStyle = "rgb(255,0,0)";
            temp.fillRect(i * w + offsetsr[0], j * h + offsetsr[1], 1, 1);
            temp.fillStyle = "rgb(0,255,0)";
            temp.fillRect(i * w + offsetsg[0], j * h + offsetsg[1], 1, 1);
            temp.fillStyle = "rgb(0,0,255)";
            temp.fillRect(i * w + offsetsb[0], j * h + offsetsb[1], 1, 1);

            if (offsetsr == offsetsg){
                temp.fillStyle = "rgb(255,255,0)";
                temp.fillRect(i * w + offsetsr[0], j * h + offsetsr[1], 1, 1);
            }
            if (offsetsr == offsetsb){
                temp.fillStyle = "rgb(255,0,255)";
                temp.fillRect(i * w + offsetsr[0], j * h + offsetsr[1], 1, 1);
            }
            if (offsetsg == offsetsb){
                temp.fillStyle = "rgb(0,255,255)";
                temp.fillRect(i * w + offsetsg[0], j * h + offsetsg[1], 1, 1);
            }
            if (offsetsr == offsetsg && offsetsg == offsetsb){
                temp.fillStyle = "rgb(255,255,255)";
                temp.fillRect(i * w + offsetsr[0], j * h + offsetsr[1], 1, 1);
            }

            temp.fillStyle = "rgb(0,0,0)";
            temp.fillRect(i * w + wPMDSprite.anims[anim].frames[j][i].offsetsk[0],
                j * h + wPMDSprite.anims[anim].frames[j][i].offsetsk[1], 1, 1);
        }
    }
    return temp.canvas;
}

function generateXML(){ 
    let xml = '<?xml version="1.0" ?>\n<AnimData>\n\t<ShadowSize>' + wPMDSprite.shadowSize + '</ShadowSize>\n\t<Anims>';
    for (i in wPMDSprite.anims){
        xml += '\n\t\t<Anim>\n\t\t\t<Name>' + wPMDSprite.anims[i].name + '</Name>';
        if (wPMDSprite.anims[i].index != undefined) xml += '\n\t\t\t<Index>' + wPMDSprite.anims[i].index + '</Index>';
        if (wPMDSprite.anims[i].copyOf){
            xml += '\n\t\t\t<CopyOf>' + wPMDSprite.anims[i].copyOf + '</CopyOf>\n\t\t</Anim>';
            continue;
        }
        xml += '\n\t\t\t<FrameWidth>'+wPMDSprite.anims[i].frameWidth+'</FrameWidth>\n\t\t\t<FrameHeight>'+wPMDSprite.anims[i].frameHeight+'</FrameHeight>';
        if (wPMDSprite.anims[i].rushFrame != undefined) xml += '\n\t\t\t<RushFrame>'+wPMDSprite.anims[i].rushFrame+'</RushFrame>';
        if (wPMDSprite.anims[i].hitFrame != undefined) xml += '\n\t\t\t<HitFrame>'+wPMDSprite.anims[i].hitFrame+'</HitFrame>';
        if (wPMDSprite.anims[i].returnFrame != undefined) xml += '\n\t\t\t<ReturnFrame>'+wPMDSprite.anims[i].returnFrame+'</ReturnFrame>';
        xml += "\n\t\t\t<Durations>";
        for (let j = 0; j < wPMDSprite.anims[i].frames[0].length; j++){
            xml += '\n\t\t\t\t<Duration>'+wPMDSprite.anims[i].frames[0][j].duration+'</Duration>';
        }
        xml += "\n\t\t\t</Durations>\n\t\t</Anim>";
    }
    xml += "\n\t</Anims>\n</AnimData>";

    return xml;
}

//
async function createPMDSpriteFromZip (zip){
    let progressSteps = ((Object.keys(zip.files).length - 1) / 3) + 1;
    progressBarSetMax(progressSteps, true);
    progressBarHide(false);

    let xmldata = await zip.file("AnimData.xml").async("text");
    let animData = parseAnimData(xmldata);

    if (!animData) {
        addWarning(1, "xml", "Malformed or invalid XML. Aborting load.");
        return;
    }

    let PMDSprite = createPMDSpriteObj('MissingNo', 'Anonymous', animData[0]);

    if (animData[1].length == 0) addWarning(1, "animation", "The file has no animations");

    for(let i = 0; i < animData[1].length; i++) {

        PMDSprite['anims'][animData[1][i][0]] = createAnimationObj (animData[1][i][0], animData[1][i][1], animData[1][i][2], animData[1][i][3], animData[1][i][4], animData[1][i][5], animData[1][i][6], animData[1][i][7]);

        if (!PMDSprite['anims'][animData[1][i][0]]["copyOf"]){

            let frames = await parseFramesFromZip(animData[1][i][0], animData[1][i][3], animData[1][i][4], zip);
            let shadows = await parseShadowsFromZip(animData[1][i][0], animData[1][i][3], animData[1][i][4], zip);
            let offsets = await parseOffsetsFromZip(animData[1][i][0], animData[1][i][3], animData[1][i][4], zip);
            if (frames.length == 1) PMDSprite['anims'][animData[1][i][0]]['frames'] = [[]];

            //errorhandling File loading
            if (frames == false){
                addWarning(1, "sprite", "The file " + animData[1][i][0] + "-Anim.png is missing or broken (name is Case Sensitive)");
                frames = generateEmptyFrames(animData[1][i][3], animData[1][i][4], animData[1][i][8].length, 8);
            }
            if (shadows == false){
                addWarning(0, "sprite", "The file " + animData[1][i][0] + "-Shadow.png is missing or broken (name is Case Sensitive)");
                shadows = generateEmptyShadows(animData[1][i][3], animData[1][i][4], animData[1][i][8].length, 8);
            }
            if (offsets == false){
                addWarning(0, "offsets", "The file " + animData[1][i][0] + "-Offsets.png is missing or broken (name is Case Sensitive)");
                offsets = generateEmptyOffsets(animData[1][i][3], animData[1][i][4], animData[1][i][8].length, 8);
            }

            for (let j = 0; j < animData[1][i][8].length; j++){

                if (frames.length == 1){

                    let boundary = findBorders(frames[0][j]);
                    PMDSprite['anims'][animData[1][i][0]]['frames'][0].push(createFrameObj(animData[1][i][8][j], frames[0][j], shadows[0][j], offsets[0][j][0], offsets[0][j][1], offsets[0][j][2], offsets[0][j][3], boundary));
                } else {

                    for (let k = 0; k < 8; k++){
                        let boundary = findBorders(frames[k][j]);
                        PMDSprite['anims'][animData[1][i][0]]['frames'][k].push(createFrameObj(animData[1][i][8][j], frames[k][j], shadows[k][j], offsets[k][j][0], offsets[k][j][1], offsets[k][j][2], offsets[k][j][3], boundary));
                    }
                }
            }
        }
        progressBarIncrease("Loading Sprite: " + animData[1][i][0] + "  -  " + (i+1) + "/" + progressSteps, true);
    }
    progressBarHide(true);
    return PMDSprite;
}

//################ PMDSprite/Animation Objects Manipulation
function createEmptyZip(){

    let proceed = confirm("Are you sure you want to create a new file? this will destroy all unsaved changes");
    if (!proceed) return;

    let PMDSprite = createPMDSpriteObj('MissingNo', 'Anonymous', 1);
    PMDSprite.anims["Walk"] = createAnimationObj("Walk",0,false,20,20,null,null,null);
    PMDSprite.anims["Idle"] = createAnimationObj("Idle",7,false,20,20,null,null,null);

    let frames = generateEmptyFrames(20, 20, 1, 8);
    let shadows = generateEmptyShadows(20, 20, 1, 8);
    let offsets = generateEmptyOffsets(20, 20, 1, 8);

    for (let k = 0; k < 8; k++){
        PMDSprite.anims["Walk"].frames[k].push(createFrameObj(4, frames[k][0], shadows[k][0], offsets[k][0][0], offsets[k][0][1], offsets[k][0][2], offsets[k][0][3], [null, null, null, null]));
        PMDSprite.anims["Idle"].frames[k].push(createFrameObj(4, frames[k][0], shadows[k][0], offsets[k][0][0], offsets[k][0][1], offsets[k][0][2], offsets[k][0][3], [null, null, null, null]));
    }
    stopDraw();
    dAnim = "Walk";
    dFrame = 0;
    wPMDSprite = PMDSprite;
    fillSelect();
    setTimeout(startDraw, 100);
}

//creates an empty object that contains all data to build the PMDSpriteZIP
function createPMDSpriteObj (name = 'MissingNo', credits = 'Anonymous', shadowSize = 2){

    let PMDSprite = {};

    PMDSprite['name'] = name; //this 2 properties are not used, for now
    PMDSprite['credits'] = credits;

    PMDSprite['shadowSize'] = parseInt(shadowSize);
    PMDSprite['anims'] = {};

    return PMDSprite;
}

//creates an empty object that contains a single animation, pretty straightfordward
function createAnimationObj (name, index = null, copyof = false, width = 0, height = 0, rush = null, hit = null, ret = null){

    let animation = {}

    animation['name'] = name;
    animation['index'] = index;
    animation['copyOf'] = copyof;

    animation['frameWidth'] = width;
    animation['frameHeight'] = height;
    animation['rushFrame'] = rush;
    animation['hitFrame'] = hit;
    animation['returnFrame'] = ret;

    animation['frames'] = Array.from({ length: 8 }, () => []); //the array has either 1 element or 8 elements and correspond to the directions clockwise

    return animation;
}

//creates an empty object that contains all its parts
function createFrameObj (duration = 1, sprite = null, shadow = null, offsetr = null, offsetg = null, offsetb = null, offsetk = null, boundary = [0,0,0,0]){

    let frame = {};

    frame['duration'] = duration;
    frame['sprite'] = sprite;

    if (sprite){
        frame['spritew'] = sprite.width;
        frame['spriteh'] = sprite.height;
    } else {
        frame['spritew'] = w;
        frame['spriteh'] = w;
    }

    frame['shadow'] = shadow;
    frame['offsetsr'] = offsetr;//left hand
    frame['offsetsg'] = offsetg;//body
    frame['offsetsb'] = offsetb;//right hand
    frame['offsetsk'] = offsetk;//face/mouth

    frame['spriteoffset'] = [0,0];
    frame['spriteboundary'] = boundary;

    return frame;
}

function applyIndex(){
    wPMDSprite.anims[dAnim].index = parseInt(document.getElementById("numbIndex").value);
}

function applyCopyOf(){
    wPMDSprite.anims[dAnim].index = parseInt(document.getElementById("selCopyOf").value);
}

function applySizeChange(){
    let tempw = parseInt(document.getElementById("numbWidth").value);
    let temph = parseInt(document.getElementById("numbHeight").value);

    let offw = (tempw == wPMDSprite.anims[dAnim].frameWidth) ? 0 : (tempw - wPMDSprite.anims[dAnim].frameWidth) / 2;
    let offh = (temph == wPMDSprite.anims[dAnim].frameHeight) ? 0 : (temph - wPMDSprite.anims[dAnim].frameHeight) / 2;

    for (let j in wPMDSprite.anims[dAnim].frames){
        for (let i in wPMDSprite.anims[dAnim].frames[j]){
            let tempctx = document.createElement("canvas").getContext("2d");
            tempctx.canvas.width = tempw;
            tempctx.canvas.height = temph;
            tempctx.drawImage(wPMDSprite.anims[dAnim].frames[j][i].sprite, offw, offh);

            wPMDSprite.anims[dAnim].frames[j][i].sprite = tempctx.canvas;

            wPMDSprite.anims[dAnim].frames[j][i].shadow[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].shadow[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsr[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsr[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsg[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsg[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsb[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsb[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsk[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsk[1] += offh;
        }
    }
    wPMDSprite.anims[dAnim].frameWidth = tempw;
    wPMDSprite.anims[dAnim].frameHeight = temph;
}

function createAnimation(){

    let newName = document.getElementById("selNewName").value;
    let newIdx = parseInt(document.getElementById("numbNewIndex").value);
    let neww = parseInt(document.getElementById("numbNewWidth").value);
    let newh = parseInt(document.getElementById("numbNewHeight").value);
    let newnf = parseInt(document.getElementById("numbNewFrames").value);
    let newdir = document.getElementById("chkNewDirection").checked ? 1 : 8;

    animObj = createAnimationObj(newName, newIdx, false, neww, newh);
    if (newdir == 1) animObj.frames = [];

    let frames = generateEmptyFrames(neww, newh, newnf, newdir);
    let shadows = generateEmptyShadows(neww, newh, newnf, newdir);
    let offsets = generateEmptyOffsets(neww, newh, newnf, newdir);

    for (let i = 0; i < newdir; i++){
        animObj.frames.push([])
        for (let j = 0; j < newnf; j++){
            animObj.frames[i].push(createFrameObj(4, frames[i][j],shadows[i][j], offsets[i][j][0], offsets[i][j][1], offsets[i][j][2], offsets[i][j][3], [0,0]));
        }
    }

    wPMDSprite.anims[newName] = animObj;

    document.getElementById("divNewAnimation").hidden = true;
    fillSelect();
}

function removeAnimation(){

    if (dAnim == "Walk" || dAnim == "Idle") return;

    let proceed = confirm("Are you sure you want to delete animation " + dAnim);

    tdDelete = dAnim;
    dAnim = "Walk"

    if (proceed){
        delete wPMDSprite.anims[tdDelete];
    }

    fillSelect();
}

function createFrame(){

    let newdir = wPMDSprite.anims[dAnim].frames == 1 ? 1 : 8;
    let neww = wPMDSprite.anims[dAnim].frameWidth;
    let newh = wPMDSprite.anims[dAnim].frameHeight;

    let frames = generateEmptyFrames(neww, newh, 1, newdir);
    let shadows = generateEmptyShadows(neww, newh, 1, newdir);
    let offsets = generateEmptyOffsets(neww, newh, 1, newdir);

    for (let i = 0; i < newdir; i++){
        wPMDSprite.anims[dAnim].frames[i].push(createFrameObj(4, frames[i][0],shadows[i][0], offsets[i][0][0], offsets[i][0][1], offsets[i][0][2], offsets[i][0][3], [0,0]));
    }
    fillFrameHolder();
}

function removeFrame(){
    
    if (wPMDSprite.anims[dAnim].frames[0].length <= 1) return;

    let proceed = confirm("Are you sure you want to delete the selected frame?");
    let newdir = wPMDSprite.anims[dAnim].frames == 1 ? 1 : 8;

    if (proceed){
        stopDraw();

        for (let i = 0; i < newdir; i++){
            wPMDSprite.anims[dAnim].frames[i].splice(dFrame, 1);
        }

        setTimeout(startDraw, 100);
        fillFrameHolder();
    }
}

//################ Draw graphics
function drawFrame(){

    let anim;
        if (wPMDSprite.anims[dAnim].copyOf){
            anim = wPMDSprite.anims[wPMDSprite.anims[dAnim].copyOf];
        } else {
            anim = wPMDSprite.anims[dAnim];
    }

    if (dWait == 0 && dAnim){
        dctx.clearRect(0, 0, 200 * dScale, 200 * dScale);
        dctx.imageSmoothingEnabled = false;
        
        let w = anim.frameWidth * dScale;
        let h = anim.frameHeight * dScale;
        let x = (75 - anim.frameWidth / 2) * dScale;
        let y = (75 - anim.frameHeight / 2) * dScale;
        let ox = anim.frames[dDirection][dFrame].spriteoffset[0] * dScale
        let oy = anim.frames[dDirection][dFrame].spriteoffset[1] * dScale

        let sx = (anim.frames[dDirection][dFrame].shadow[0] - 16) * dScale;
        let sy = (anim.frames[dDirection][dFrame].shadow[1] - 8) * dScale;

        if (dBackground) dctx.drawImage(imgBackground, backoffx * dScale, backoffy * dScale, 240 * dScale, 240 * dScale);

        if (dShadow) dctx.drawImage(imgShadows, 0, wPMDSprite.shadowSize * 32, 32, 16, x + sx, y + sy, 32 * dScale, 16 * dScale);

        if (anim.frames[dDirection][dFrame].sprite)
            dctx.drawImage(anim.frames[dDirection][dFrame].sprite, x + ox, y + oy, w, h);

        if (dOffsets){
            if (offhighlight){

                dctx.fillStyle = offhighlightarray[offhighlightn];

                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsr[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsr[1] * dScale, dScale, dScale);
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsg[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsg[1] * dScale, dScale, dScale);
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsb[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsb[1] * dScale, dScale, dScale);
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsk[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsk[1] * dScale, dScale, dScale);
                
                offhighlightn++;
                if (offhighlightn == 5) offhighlightn = 0;

            } else {

                dctx.fillStyle = "rgb(255,0,0)";
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsr[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsr[1] * dScale, dScale, dScale);
                
                dctx.fillStyle = "rgb(0,255,0)";
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsg[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsg[1] * dScale, dScale, dScale);
                
                dctx.fillStyle = "rgb(0,0,255)";
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsb[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsb[1] * dScale, dScale, dScale);
                
                dctx.fillStyle = "rgb(0,0,0)";
                dctx.fillRect(x + anim.frames[dDirection][dFrame].offsetsk[0] * dScale, y + anim.frames[dDirection][dFrame].offsetsk[1] * dScale, dScale, dScale);
            }
        }
    }

    dWait++;
    if(dWait >= anim.frames[dDirection][dFrame].duration * dSpeed){
        dFrame++;
        dWait = 0;
    }
    if(dFrame >=  anim.frames[dDirection].length) dFrame = 0;

    if(!dStop) requestAnimationFrame(drawFrame);
}

function startDraw(){

    dFrame = 0;
    dWait = 0;
    dStop = false;

    drawFrame();
}

function stopDraw(){

    dStop = true;
}

function restartDraw(){

    stopDraw();
    setTimeout(startDraw, 100);
}

function stepDraw(){

    stopDraw();
    
    dWait = 0;
    dFrame++;
    if(dFrame >= wPMDSprite["anims"][dAnim]["frames"][dDirection].length) dFrame = 0;

    changeSelectedFrame(dFrame);

    setTimeout(drawFrame(), 100);
}

function redrawFrame(){

    jumpToFrame(dFrame);
}

function jumpToFrame(frame){
    stopDraw();

    dFrame = frame;
    dWait = 0;

    drawFrame();
}

//################ Warning Control

//Adds an entry to the error tracker, severity = 1 Error, 0 = Warning
function addWarning (severity,category,msg){
    entry = {
        'severity': severity,
        'category': category,
        'msg': msg
    }

    for (i in activeErrors) if (activeErrors[i] == entry) return;

    activeErrors.push(entry);
}

//categories: sprite offsets shadow animation frames xml zip
function clearWarnings (category = false){

    if (!category){
        activeErrors = [];
        return;
    }
    let temp = [];
    for (let i in activeErrors) if (activeErrors[i]['category'] != category) temp.push(activeErrors[i]);
    activeErrors = temp;
}

//this one gonna be big ¬¬
function reescanWarnings(){

}

//################ GUI
function fillSelect(){
    
    document.getElementById('selectAnim').innerHTML = "";

    iterable = Object.keys(wPMDSprite['anims']);
    for (i in iterable){

        if(iterable[i] == "length") continue;

        let option = document.createElement("option");
        option.innerHTML = iterable[i];
        option.setAttribute("value", iterable[i]);
        document.getElementById('selectAnim').appendChild(option);
    }

    changeAnim();
    fillCopyOfSelect();
}

//div optHolder
function fillFrameHolder(){

    let holder = document.getElementById("optHolder");
    holder.innerHTML = "";

    let frames, copy;
    if (wPMDSprite.anims[dAnim].copyOf){
        frames = wPMDSprite.anims[wPMDSprite.anims[dAnim].copyOf].frames[0];
        notcopy = false;
    } else {
        frames = wPMDSprite.anims[dAnim].frames[0];
        notcopy = true;
    }

    for (i in frames){
        
        let input = document.createElement("input");
        input.setAttribute("type","radio");
        input.setAttribute("name","frame");
        input.setAttribute("id","frame" + i);
        input.setAttribute("onchange","changeSelectedFrame(" + i + ");jumpToFrame(" + i + ");");
        input.setAttribute("value", i);
        holder.appendChild(input)
        let label = document.createElement("label");
        label.setAttribute("for", "frame" + i);
        label.innerHTML = "Frame " + i;
        holder.appendChild(label);

        if (notcopy){
            label = document.createElement("label");
            label.setAttribute("for", i);
            label.innerHTML = "\tDuration";
            holder.appendChild(label);
            input = document.createElement("input");
            input.setAttribute("type","number");
            input.setAttribute("name","duration");
            input.setAttribute("id","frameDuration" + i);
            input.setAttribute("min","0");
            input.setAttribute("max","200");
            input.setAttribute("onchange","changeFrameDuration(" + i + ", this);");
            input.setAttribute("value", frames[i]["duration"]);
            holder.appendChild(input)
        }

        holder.appendChild(document.createElement("br"));
    }
    holder.firstChild.setAttribute("checked","true");

    changeSelectedFrame(0);
}

function fillDirectionSelect(){
    let select = document.getElementById("selectDirect");
    select.innerHTML = "";

    if (wPMDSprite["anims"][dAnim]["frames"].length == 1){
        select.innerHTML = "<option value='0'>only</option>";
    } else {
        select.innerHTML = "<option value='0'>d</option><option value='1'>dr</option><option value='2'>r</option><option value='3'>ur</option><option value='4'>u</option><option value='5'>ul</option><option value='6'>l</option><option value='7'>dl</option>"
    }
    select.getElementsByTagName("option")[0].checked
}

function fillCopyOfSelect(){

    document.getElementById('selCopyOf').innerHTML = "";

    for (i in wPMDSprite.anims){

        if(wPMDSprite.anims[i].copyOf) continue;

        let option = document.createElement("option");
        option.innerHTML = wPMDSprite.anims[i].name;
        option.setAttribute("value", wPMDSprite.anims[i].name);
        document.getElementById('selCopyOf').appendChild(option);
    }
}

function tweekSprite(element, direction){
    let coord;
    stopDraw();
    
    switch (element){
        case "sp":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["spriteoffset"];
            break;
        case "sw":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["shadow"];
            break;
        case "or":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsr"];
            break;
        case "og":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsg"];
            break;
        case "ob":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsb"];
            break;
        case "ok":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsk"];
            break;
    }
    switch (direction){
        case "lu":
            coord[0]--;
            coord[1]--;
            break;
        case "u":
            coord[1]--;
            break;
        case "ur":
            coord[0]++;
            coord[1]--;
            break;
        case "l":
            coord[0]--;
            break;
        case "r":
            coord[0]++;
            break;
        case "ld":
            coord[0]--;
            coord[1]++;
            break;
        case "d":
            coord[1]++;
            break;
        case "dr":
            coord[0]++;
            coord[1]++;
            break;
    }
    redrawFrame();
}

function getSelectedFrame(){
    for (i in document.getElementById("optHolder").getElementsByTagName("input")){
        if (document.getElementById("optHolder").getElementsByTagName("input")[i].checked){
            return i;
        }
    }
}

function addAnimation(){

    document.getElementById('selNewName').innerHTML = "";

    for (i in posibleNames){
        if (posibleNames[i] in wPMDSprite.anims) continue;

        let option = document.createElement("option");
        option.innerHTML = posibleNames[i];
        option.setAttribute("value", posibleNames[i]);
        document.getElementById('selNewName').appendChild(option);
    }
    changeNewName();
    document.getElementById("divNewAnimation").hidden = false;
}

//when the animation selector changes
function changeAnim(){

    dAnim = document.getElementById('selectAnim').value;

    document.getElementById('animName').innerHTML = wPMDSprite.anims[dAnim].name;
    document.getElementById('numbIndex').value = wPMDSprite.anims[dAnim].index;

    let bool = (wPMDSprite.anims[dAnim].copyOf) ? true : false

    document.getElementById('chkCopyOf').checked = bool;
    document.getElementById('selCopyOf').value = wPMDSprite.anims[dAnim].copyOf;
    document.getElementById('numbWidth').value = wPMDSprite.anims[dAnim].frameWidth;
    document.getElementById('numbHeight').value = wPMDSprite.anims[dAnim].frameHeight;
    document.getElementById('chkRushFrame').checked = (wPMDSprite.anims[dAnim].rushFrame != null);
    document.getElementById('numbRushFrame').value = wPMDSprite.anims[dAnim].rushFrame;
    document.getElementById('chkHitFrame').checked = (wPMDSprite.anims[dAnim].hitFrame != null);
    document.getElementById('numbHitFrame').value = wPMDSprite.anims[dAnim].hitFrame;
    document.getElementById('chkReturnFrame').checked = (wPMDSprite.anims[dAnim].returnFrame != null);
    document.getElementById('numbReturnFrame').value = wPMDSprite.anims[dAnim].returnFrame;

    document.getElementById('selCopyOf').disabled = !bool;
    document.getElementById('butCopyOf').disabled = !bool;
    document.getElementById('numbWidth').disabled = bool;
    document.getElementById('numbHeight').disabled = bool;
    document.getElementById('butHeight').disabled = bool;
    document.getElementById('chkRushFrame').disabled = bool;
    document.getElementById('numbRushFrame').disabled = bool;
    document.getElementById('numbRushFrame').max = wPMDSprite.anims[dAnim].frames[0].length - 1;
    document.getElementById('chkHitFrame').disabled = bool;
    document.getElementById('numbHitFrame').disabled = bool;
    document.getElementById('numbHitFrame').max = wPMDSprite.anims[dAnim].frames[0].length - 1;
    document.getElementById('chkReturnFrame').disabled = bool;
    document.getElementById('numbReturnFrame').disabled = bool;
    document.getElementById('numbReturnFrame').max = wPMDSprite.anims[dAnim].frames[0].length - 1;

    if (dAnim == "Walk" || dAnim == "Idle"){
        document.getElementById('butDelAnim').disabled = true;
    } else{
        document.getElementById('butDelAnim').disabled = false;
    }

    document.getElementById('divFramesTweek').hidden = bool;
    document.getElementById('butAddFrame').disabled = bool;
    document.getElementById('butRemoveFrame').disabled = bool;
    
    fillDirectionSelect();
    fillFrameHolder();
    changeSpecialFrame();
    restartDraw();
}

//when the frame is changed
function changeSelectedFrame(frame){

    dFrame = frame;
    document.getElementById("frame" + frame).checked = true;
}

function changeChkDraw(){
    dShadow = document.getElementById('chkshadow').checked;
    dOffsets = document.getElementById('chkoffsets').checked;
    dBackground = document.getElementById('chkbackground').checked;
}

function changeChkHighlight(){
    offhighlightn = 0;
    offhighlight = document.getElementById('chkhighlight').checked;
}

function changeDirection(){

    changeSelectedFrame(0);

    dDirection = parseInt(document.getElementById('selectDirect').value);

    if (dStop) jumpToFrame(dFrame);
}

function changeScale(){

    dScale = document.getElementById('selectScale').value;
    dctx.canvas = document.getElementById('frame');

    dctx.canvas.height = 150 * dScale;
    dctx.canvas.width = 150 * dScale;

    if (dStop) jumpToFrame(dFrame);
}

function changeSpeed(){
    dSpeed = parseInt(document.getElementById('selectSpeed').value);

    restartDraw()
}

function changeNewName(){

    let val = document.getElementById('selNewName').value;
    document.getElementById('numbNewIndex').value = posibleNames.indexOf(val);
}

function changeFrameDuration(frame, element){

    wPMDSprite.anims[dAnim].frames[0][frame].duration = parseInt(element.value);
}

function changeSpecialFrame(spec=null){

    if (document.getElementById('chkRushFrame').checked){
        document.getElementById('numbRushFrame').disabled = false;
        if (!wPMDSprite.anims[dAnim].rushFrame) wPMDSprite.anims[dAnim].rushFrame = 0;
        document.getElementById('numbRushFrame').value = wPMDSprite.anims[dAnim].rushFrame;
    } else {
        document.getElementById('numbRushFrame').disabled = true;
        wPMDSprite.anims[dAnim].rushFrame = null;
    }
    if (document.getElementById('chkHitFrame').checked){
        document.getElementById('numbHitFrame').disabled = false;
        if (!wPMDSprite.anims[dAnim].hitFrame) wPMDSprite.anims[dAnim].hitFrame = 0
        document.getElementById('numbHitFrame').value = wPMDSprite.anims[dAnim].hitFrame;
    } else {
        document.getElementById('numbHitFrame').disabled = true;
        wPMDSprite.anims[dAnim].hitFrame = null;
    }
    if (document.getElementById('chkReturnFrame').checked){
        document.getElementById('numbReturnFrame').disabled = false;
        if (!wPMDSprite.anims[dAnim].returnFrame) wPMDSprite.anims[dAnim].returnFrame = 0;
        document.getElementById('numbReturnFrame').value = wPMDSprite.anims[dAnim].returnFrame;
    } else {
        document.getElementById('numbReturnFrame').disabled = true;
        wPMDSprite.anims[dAnim].returnFrame = null;
    }
    switch (spec){
        case "rush": 
            wPMDSprite.anims[dAnim].rushFrame = parseInt(document.getElementById('numbRushFrame').value);
            break;
        case "hit": 
            wPMDSprite.anims[dAnim].hitFrame = parseInt(document.getElementById('chkHitFrame').value);
            break;
        case "return": 
            wPMDSprite.anims[dAnim].returnFrame = parseInt(document.getElementById('chkReturnFrame').value);
            break;
    }
}

function changeChkCopyOf(){
    let bool = document.getElementById('chkCopyOf').checked;

    document.getElementById('selCopyOf').disabled = !bool;
    document.getElementById('butCopyOf').disabled = !bool;
}

function updateWarningsDiv(entry = false){
    let container = document.getElementById("containerWarnings");
    container.innerHTML = "";

    if (!entry){
        for (i in activeErrors){

            let p = document.createElement("p");
            p.setAttribute("class","Warning" + activeErrors[i].severity);
            p.innerHTML = "[" + activeErrors[i].category + "] " + activeErrors[i].msg;
            container.appendChild(p);
        }
    } else {
        let p = document.createElement("p");
        p.setAttribute("class","Warning" + entry.severity);
        p.innerHTML = "[" + entry.category + "] " + entry.msg;
        container.appendChild(p);
    }
}

function changeIndex(){

    let tidx = document.getElementById("numbIndex").value;
    let repeated = false;
    for (i in wPMDSprite.anims){
        if (wPMDSprite.anims[i].index == tidx && i != dAnim){
            repeated = true;
        }
    }
    document.getElementById("butIndex").disabled = repeated;
}

function progressBarIncrease (message = "Loading"){

    currProgress++;
    progressBarModify(message);
}

function progressBarSet (progress = 0){

    currProgress = progress;
    progressBarModify();
}

function progressBarSetMax (max, reset = false, message = false){
    maxProgress = max;
    if (reset){
        currProgress = 0;
    }

    progressBarModify(message);
}

function progressBarModify (message = false){
    let bar = document.getElementById("progressBarFill");
    let text = document.getElementById("progressBarText");

    width = (currProgress/maxProgress) * 100;

    bar.style.width = width + "%";
    if (message) text.innerHTML = message;
}

function progressBarHide(bool){
    document.getElementById("progressBar").hidden = bool;
}









