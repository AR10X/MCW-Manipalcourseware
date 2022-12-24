
/* ---------------------------------------------------
   DROPDOWN LIST 
----------------------------------------------------- */
var sectionByCategory = {
    AERO: ["A"],
    AUTO: ["A"],
    BME: ["A"],
    BIO: ["A"],
    CHE: ["A","B"],
    CIV: ["A","B","C"],
    CCE: ["A","B"],
    CSE: ["A","B","C","D"],
    ELE: ["A","B","C"],
    ECE: ["A","B","C","D"],
    IP: ["A"],
    IT: ["A","B"],
    EI: ["A","B"],
    MME: ["A","B","C","D"],
    MTE: ["A","B"],
    MED: ["A"]

}

var subjectByCategory = {
    AERO: ["A"],
    AUTO: ["A"],
    BME: ["A"],
    BIO: ["A"],
    CHE: ["A","B"],
    CIV: ["A","B","C"],
    CCE: ["A","B"],
    CSE: ["MATHS III","DSD","OOPS","DSA","COA"],
    ELE: ["A","B","C"],
    ECE: ["A","B","C","D"],
    IP: ["A"],
    IT: ["A","B"],
    EI: ["A","B"],
    MME: ["MATHS III","KOM","MSM","MT","SOM","THERMO"],
    MTE: ["A","B"],
    MED: ["A"]
}

function changecat(value) {
    if (value.length == 0) document.getElementById("category").innerHTML = "<option></option>";
    else {
        var catOptions = "";
        var thirdCatOptions = "";
        for (var categoryId in sectionByCategory[value]) {
            catOptions += "<option>" + sectionByCategory[value][categoryId] + "</option>";
        }
        for (var categoryId in subjectByCategory[value]) {
                thirdCatOptions += "<option>" + subjectByCategory[value][categoryId] + "</option>";
        }
        document.getElementById("category").innerHTML = catOptions;
        document.getElementById("category2").innerHTML = thirdCatOptions
    }
}