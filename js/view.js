var oReq;
if (window.XMLHttpRequest) {
    oReq = new XMLHttpRequest();
} else if (window.ActiveXObject) {
    oReq = new ActiveXObject('MSXML2.XMLHTTP.3.0');
} else {
    throw "XHR unavailable for your browser";
}

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
            result[sheetName] = roa;
        }
    });
    return result;
}

function process_wb(wb) {
    var output = to_json(wb);

    loadingComplete();

    $('#table')
        .bind('dynatable:init', function(e, dynatable) {
            dynatable.sorts.functions["kronarsSort"] = kronarsSort;
            dynatable.sorts.functions["platsSort"] = platsSort;
            dynatable.sorts.functions["dateSort"] = dateSort;
        })
        .dynatable({
            dataset: {
                sorts: {'Kprice': -1},
                records: output["Inventory"],
                perPageDefault: 250,
                perPageOptions: [100, 250, 500, 1000],
                sortTypes: {
                    'Price': 'number',
                    'Plats': 'platsSort',
                    'Kprice': 'kronarsSort',
                    'Date': 'dateSort'
                }
            },
            table: {
                copyHeaderClass: true
            },
            writers: {
                'Item': function(record) {
                    if(record['Item']) {
                        var searchLink = " <div style=\"float: right;\"><a class=\"link\" target=\"_blank\" " +
                            "href=\"https://elanthipedia.play.net/mediawiki/index.php?search=" +
                            encodeURIComponent(record['Item']) + "&go=Go&title=Special%3ASearch\">";
                        searchLink += "e";
                        searchLink += "</a></div>";

                        if(/pair of|series of|set of/.test(record['Item'])) {
                            return record['Item'].replace(/(\S+)\s*s($|\s)/, ' <b>$1s</b> ') + searchLink;
                        }

                        for(var i = 0; i < nounMatches.length; i++) {
                            var regex = new RegExp("(\\S+)\\s*(?=" + nounMatches[i] + ")");

                            if(record['Item'].search(regex) != -1) {
                                return record['Item'].replace(regex, ' <b>$1</b> ') + searchLink;
                            }
                        }
                    }
                    return record['Item'].replace(/\s([a-z']+(?:-[a-z']+)?)$/, ' <b>$1</b>') + searchLink;
                }
            }
        });
}

function load(url){
    oReq.open("GET", url, true);

    if (typeof Uint8Array !== 'undefined') {
        oReq.responseType = "arraybuffer";
        oReq.onload = function (e) {
            var arraybuffer = oReq.response;
            var data = new Uint8Array(arraybuffer);
            var arr = [];
            for (var i = 0; i != data.length; ++i) {
                arr[i] = String.fromCharCode(data[i]);
            }

            var wb = XLSX.read(arr.join(""), {type: "binary"});

            process_wb(wb);
        };
    } else {
        throw "Service unavailable for your browser";
    }
    oReq.send();
}

function handleFile(e) {
    var files = e.target.files;
    var f = files[0];

    var reader = new FileReader();
    reader.onload = function(e) {
        var data = new Uint8Array(e.target.result);
        var arr = [];
        for (var i = 0; i != data.length; ++i) {
            arr[i] = String.fromCharCode(data[i]);
        }

        var wb = XLSX.read(arr.join(""), {type: "binary"});

        process_wb(wb);
    };
    reader.readAsArrayBuffer(f);
}

function loadingStarted() {
    $("#load-input").hide();
    $("#loader-wrapper").show();
}

function loadingComplete() {
    $(".panel").show();
    $('body').addClass('loaded');
}