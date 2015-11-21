function dateSort(a, b, attr, direction) {
    var aDate = new Date(a.Date).getTime();
    var bDate = new Date(b.Date).getTime();

    var comparison = aDate - bDate;

    return direction > 0 ? comparison : -comparison;
}

function currencySort(a, b, attr, direction) {
    var aInt = parseInt(a.replace(/,/g, ''));
    var bInt = parseInt(b.replace(/,/g, ''));
    var comparison = aInt - bInt;

    return direction > 0 ? comparison : -comparison;
}

function kronarsSort(a, b, attr, direction) {
    return currencySort(a.Kprice, b.Kprice, attr, direction);
}

function platsSort(a, b, attr, direction) {
    return currencySort(a.Plats, b.Plats, attr, direction);
}