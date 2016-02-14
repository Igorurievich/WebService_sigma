/// <reference path="C:\Users\Женя\Documents\Visual Studio 2015\Projects\Sigma project\WebService3\WebService3\Views/UserAction/Map.cshtml" />
/// <reference path="C:\Users\Женя\Documents\Visual Studio 2015\Projects\Sigma project\WebService3\WebService3\Views/UserAction/Map.cshtml" />
var con;
var map;
var deviceID;
var path = [];
var markers = [];
var polygons = [];
var oldpolygon;
var oldEditPolygin;
var idEditZone;
var zoneInfo;
var ta;
var idTimeAct;
var timeActIndex;
var token;
initMap();

function btnNewZone() {
    claenField();
    map.addListener('click', addPoint);
    document.getElementById("control-zone").style.display = "none";
    document.getElementById("save-cancel").style.display = "block";
    getZone();
}

function btnEditZone() {
    claenField();
    getZone();
    map.addListener('click', editZone);
    document.getElementById("control-zone").style.display = "none";
    document.getElementById("control-edit").style.display = "block";
    document.getElementById("timeActiveControl").style.display = "block";
    changeZone();
}

function btnsave() {
    setZone();
    map.removeListener('click', editZone);
    claenField();
    map.addListener("click", showTimeActive);
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("save-cancel").style.display = "none";
}

function btncancel() {
    map.removeListener('click', editZone);
    map.removeListener('click', addPoint);
    claenField();
    getZone();
    map.addListener("click", showTimeActive);
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("save-cancel").style.display = "none";
    document.getElementById("control-edit").style.display = "none";
    document.getElementById("timeActiveControl").style.display = "none";
}

function btnRemove() {
    removeZone();
    map.removeListener('click', editZone);
    map.removeListener('click', addPoint);
    claenField();
    getZone();
    map.addListener("click", showTimeActive);
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("control-edit").style.display = "none";
    document.getElementById("timeActiveControl").style.display = "none";
}

function btnUpdate() {
    updataZone();
    map.removeListener('click', editZone);
    claenField();
    map.addListener("click", showTimeActive);
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("control-edit").style.display = "none";
    document.getElementById("timeActiveControl").style.display = "none";
}

function removeZone() {
    con.server.removeZoneAsync(idEditZone);
}

function updataZone() {
    var poligon = '';
    for (var i = 0; i < path.length; i++) {
        poligon += path[i].latitude + ' ' + path[i].longitude + ', ';
    }
    if (path.length > 2) {
        con.server.updateZoneAsync(idEditZone, $('#zoneNameEdit').val(), poligon).done(function () {
            getZone();
        });
    }
}

$(function () {
    $.connection.hub.url = 'http://192.168.0.103:8080/Server/signalr';
    con = $.connection.connectionHub;
    $.connection.hub.start().done(function () {
        checkCookie();
    });
});

function initMap() {
    var mapContainer = document.getElementById("map");
    map = (window.map = new ovi.mapsapi.map.Display(mapContainer, {
        center: [46.44993, 30.7506066666667],
        zoomLevel: 11,
        components: [
        new ovi.mapsapi.map.component.Behavior(),
        new ovi.mapsapi.map.component.ZoomBar(),
        new ovi.mapsapi.map.component.ViewControl,
	    new ovi.mapsapi.map.component.TypeSelector(),
	    new ovi.mapsapi.map.component.ScaleBar(),
	    new ovi.mapsapi.map.component.Overview()]
    }));
    map.addListener("click", showTimeActive);
}

function checkCookie() {
    token = $.cookie('tokenInfo');
    getDevice();
}

function getDevice() {
    con.server.getDevice(token).done(function (json) {
        var device = JSON.parse(json);
        for (var i = 0; i < device.length; i++) {
            var option = document.createElement('option');
            option.text = device[i].Device_Id;
            option.value = device[i].Id;
            combobox.add(option);
        }
        deviceID = combobox.value;
        getZone();
    });
}

function addPoint(event) {
    var object = event.target;
    if (!(object instanceof ovi.mapsapi.map.StandardMarker)) {
        var click_coords = map.pixelToGeo(event.displayX, event.displayY);
        var marker = new ovi.mapsapi.map.StandardMarker(click_coords, {
            draggable: true
        });
        var pos;
        if (path.length > 2) {
            pos = index(click_coords.latitude, click_coords.longitude);
            path.splice(pos, 0, click_coords);
            markers.splice(pos, 0, marker);
        }
        else {
            path.push(click_coords);
            markers.push(marker);
        }
        marker.addListener("dragend", dragendMarker);
        marker.addListener("click", removeMarker);
        map.objects.add(marker);
        polyShow();
    }
}

function index(lat, lon) {
    var size = [];
    var indx = 0;
    for (var i = 0; i < path.length; i++) {
        if (i === path.length - 1) {
            size.push(Math.sqrt(Math.pow(path[i].latitude - lat, 2) + Math.pow(path[i].longitude - lon, 2))
            + Math.sqrt(Math.pow(path[0].latitude - lat, 2) + Math.pow(path[0].longitude - lon, 2)));
        }
        else {
            size.push(Math.sqrt(Math.pow(path[i].latitude - lat, 2) + Math.pow(path[i].longitude - lon, 2))
                + Math.sqrt(Math.pow(path[i + 1].latitude - lat, 2) + Math.pow(path[i + 1].longitude - lon, 2)));
        }
    }
    var min = size[0];
    for (var j = 0; j < size.length; j++)
        if (size[j] < min) {
            min = size[j];
            indx = j + 1;
        }
    return indx;
}

function dragendMarker() {
    for (var i = 0, I = markers.length; i < I && markers[i] !== this; ++i);
    path[i] = this.coordinate;
    polyShow();
}

function removeMarker() {
    map.objects.remove(this);
    for (var i = 0, I = markers.length; i < I && markers[i] !== this; ++i);
    markers.splice(i, 1);
    path.splice(i, 1);
    polyShow();
}

function claenField() {
    map.removeListener('click', addPoint);
    map.removeListener('click', showTimeActive);
    map.objects.clear();
    markers = [];
    path = [];
    oldEditPolygin = null;
}

function changeDevice() {
    deviceID = combobox.value;
    map.objects.clear();
    getZone();
}

function polyShow() {
    map.objects.remove(oldpolygon);
    if (path.length > 1) {
        var poly = new ovi.mapsapi.map.Polygon(
        path,
        {
            pen: { strokeColor: "#000", lineWidth: 1 },
            brush: { color: "#CC2A" }
        });
        oldpolygon = poly;
        map.objects.add(poly);
    }
}

function getZone() {
    while (comboboxdel.length > 0) {
        comboboxdel[comboboxdel.length - 1] = null;
    }
    polygons = [];
    clearPolygon();
    con.server.getZoneAsync(deviceID).done(function (zones_) {
        zoneInfo = JSON.parse(zones_);
        for (var i = 0; i < zoneInfo.length; i++) {
            var temp = zoneInfo[i].Area.trim().trim(',');
            var point = temp.split(',');
            var pathstemp = [];
            for (var j = 0; j < point.length - 1; j++) {
                var latlngStr = point[j].trim(' ').split(" ");
                pathstemp.push(new ovi.mapsapi.geo.Coordinate(parseFloat(latlngStr[0]), parseFloat(latlngStr[1])));
            }
            var poly = new ovi.mapsapi.map.Polygon(
            pathstemp,
            {
                pen: { strokeColor: "#000", lineWidth: 1 },
                brush: { color: "#CC2A" }
            }
            );
            var obj = { polygon: poly, id: zoneInfo[i].Id };
            polygons.push(obj);
            map.objects.add(poly);
            var option = document.createElement('option');
            option.text = zoneInfo[i].Description;
            option.value = zoneInfo[i].Id;
            comboboxdel.add(option);
        }
    });
}

function editZone(event) {
    var object;
    if (event instanceof ovi.mapsapi.map.Polygon)
        object = event;
    else
        object = event.target;
    if (object instanceof ovi.mapsapi.map.Polygon) {
        if (oldEditPolygin !== object) {
            if (oldEditPolygin != null)
                map.objects.add(oldEditPolygin);
            oldEditPolygin = object;
        }
        map.objects.remove(object);
        map.removeListener("click", addPoint);
        idEditZone = searchZodeId(object);
        selectCB();
        clearMarker();
        markers = [];
        path = [];
        for (var i = 0; i < object.path.internalArray.length; i++) {
            var lat;
            var lon;
            if (i % 3 === 0) {
                lat = object.path.internalArray[i];
            }
            else if (i % 3 === 1) {
                lon = object.path.internalArray[i];
            }
            else {
                var coord = new ovi.mapsapi.geo.Coordinate(lat, lon);
                var marker = new ovi.mapsapi.map.StandardMarker(coord, {
                    draggable: true
                });
                path.push(coord);
                markers.push(marker);
                marker.addListener("click", removeMarker);
                marker.addListener("dragend", dragendMarker);
                map.objects.add(marker);
            }
        }
        polyShow();
        map.addListener("click", addPoint);
        getTimeActive();
    }
}

function searchZodeId(polygon) {
    for (var i = 0; i < polygons.length; i++) {
        if (polygon === polygons[i].polygon)
            return polygons[i].id;
    }
}

function clearMarker() {
    var arr = map.objects.asArray();
    for (var i = 0; i < arr.length; i++)
        if (arr[i] instanceof ovi.mapsapi.map.Marker) {
            map.objects.remove(arr[i]);
        }
}

function clearPolygon() {
    var arr = map.objects.asArray();
    for (var i = 0; i < arr.length; i++)
        if (arr[i] instanceof ovi.mapsapi.map.Polygon) {
            map.objects.remove(arr[i]);
        }
}

function setZone() {
    var poligon = '';
    for (var i = 0; i < path.length; i++) {
        poligon += path[i].latitude + ' ' + path[i].longitude + ', ';
    }
    if (path.length > 2) {
        con.server.setZoneAsync(deviceID, $('#zoneName').val(), poligon).done(function (error) {
            console.log(error);
            getZone();
        });
    }
}

function changeZone() {
    for (var i = 0; i < zoneInfo.length; i++) {
        if (zoneInfo[i].Id === comboboxdel.value) {
            zoneNameEdit.value = zoneInfo[i].Description;
            editZone(polygons[i].polygon);
        }
    }
}

function selectCB() {
    for (var i = 0; i < comboboxdel.length; i++)
        if (comboboxdel[i].value === idEditZone)
            comboboxdel[i].selected = true;
    for (var j = 0; j < zoneInfo.length; j++) {
        if (zoneInfo[j].Id === comboboxdel.value) {
            zoneNameEdit.value = zoneInfo[j].Description;
        }
    }
}

function setTimeActive() {
    var dayofweek = 0;
    Array.prototype.forEach.call(document.querySelectorAll('input[type=checkbox]'), function (ths) {
        if (ths.checked)
            dayofweek += parseInt(ths.value);
    });
    con.server.setTimeActiveAsync(idEditZone, dayofweek, startTime.value, endTime.value).done(function () {
        for (var i = 0; i < ta.length; i++) {
            document.getElementById("active" + i).remove();
        }
        getTimeActive();
    });
}

function getTimeActive() {
    con.server.getTimeActiveAsync(idEditZone).done(function (timeActive) {
        ta = JSON.parse(timeActive);
        var activeInfo = '';
        for (var i = 0; i < ta.length; i++) {
            activeInfo += "<div class='time-active' id='active" + i + "' onclick='mouseEvent(" + i + ")'>Days: " + dayOfWeekToString(ta[i].DayOfWeek) + "<br/> Time: "
            + ta[i].StartTime + " - " + ta[i].EndTime + "<br/></div>";
        }
        dateActive.innerHTML = activeInfo;
    });
}

function removeTimeActive() {
    con.server.removeTimeActiveAsync(idTimeAct);
    for (var i = 0; i < ta.length; i++) {
        document.getElementById("active" + i).remove();
    }
    getTimeActive();
}

function mouseEvent(index) {
    for (var i = 0; i < ta.length; i++) {
        document.getElementById("active" + i).style.backgroundColor = 'rgb(224, 224, 209)';
    }
    timeActIndex = index;
    idTimeAct = ta[index].Id;
    document.getElementById("active" + index).style.backgroundColor = '#cce5ff';
}

function chakedAll() {
    for (var i = 1; i < 8; i++) {
        if (!document.getElementById("ch_boxAll").checked) {
            document.getElementById("ch_box" + i).checked = false;
        } else {
            document.getElementById("ch_box" + i).checked = true;
        }
    }
}

function dayOfWeekToString(dec) {
    var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    if (dec > 128)
        return "All";
    var bin = dec.toString(2);
    var activeDay = "";
    for (var i = 0; i < bin.length; i++) {
        if (bin[i] === 1) {
            if (activeDay === "")
                activeDay += days[i];
            else
                activeDay += ', ' + days[i];
        }
    }
    return activeDay;
}

function showTimeActive(event) {
    var object = event.target;
    if (object instanceof ovi.mapsapi.map.Polygon) {
        if (oldEditPolygin !== object) {
            if (oldEditPolygin != null) {
                map.objects.remove(oldEditPolygin);
                oldEditPolygin.pen = { strokeColor: "#000", lineWidth: 1 };
                map.objects.add(oldEditPolygin);
            }
            oldEditPolygin = object;
        }
        idEditZone = searchZodeId(object);
        getTimeActive();
        map.objects.remove(object);
        object.pen = { strokeColor: "#000", lineWidth: 2 };
        map.objects.add(object);
    }
}

