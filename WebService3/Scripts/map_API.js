initMap();
var devicesAll = [];


function PolygonCollection() {
    var _this = this;
    this.array = [];
    this.index = -1;
    this.temp = null;

    this.newZone = function () {
        this.temp = new Polygon();
        this.temp.flagVM = true;
        map.addListener("click", this.temp.event_addPoint);
    },

    this.save = function () {
        if (this.temp.path.length > 2) {
            for (var i = 0; i < this.array.length; i++) {
                this.array[i].activityLineWidth(1)
            }
            this.temp.saveServer();
            map.removeListener("click", this.temp.event_addPoint);
            this.index = -1;
            for (var i = 0; i < combobox.length; i++) {
                if (combobox[i].text === "All") {
                    combobox[i].selected = true;
                }
            }
            document.getElementById("btnEdit").style.display = "none";
            document.getElementById("btnRomove").style.display = "none";
        }
    },

    this.add = function (obj) {
        obj.poly.addListener("click", this.activity)
        this.array.push(obj);
        var option = document.createElement('option');
        option.text = obj.polygonInfo.Description;
        option.value = obj.polygonInfo.Id;
        combobox.add(option);
    },

    this.activity = function (event) {
        for (var i = 0; i < _this.array.length; i++) {
            if (_this.array[i].poly == this) {
                _this.index = i;
                _this.array[i].activityLineWidth(3);
                _this.array[i].showTimeActive();
                combobox[_this.getIndexCB(_this.array[i].polygonInfo.Id)].selected = true;
                document.getElementById("btnEdit").style.display = "block";
                document.getElementById("btnRomove").style.display = "block";
                document.getElementById("btnAddDevice").style.display = "block";
                var str = '';
                for (var j = 0; j < _this.array[_this.index].devices.length; j++) {
                    for (var k = 0; k < devicesAll.length; k++) {
                        if (devicesAll[k].Id == _this.array[_this.index].devices[j].Device_Id) {
                            str += "<div>" + devicesAll[k].Name + "</div>";
                        }
                    }
                }
                devinfo.innerHTML = str;
            }
            else if (_this.array[i].lineWidth != 1) {
                _this.array[i].activityLineWidth(1);
            }
        }
        console.log(token);
        con.server.setDeviceConfiguration(token, 10);
    }

    this.updateShowDevice = function () {
        var str = '';
        for (var j = 0; j < this.array[_this.index].devices.length; j++) {
            for (var k = 0; k < devicesAll.length; k++) {             
                if (devicesAll[k].Id == this.array[this.index].devices[j].Device_Id) {
                    str += "<div>" + devicesAll[k].Name + "</div>";
                }
            }
        }
        devinfo.innerHTML = str;
    }

    this.edit = function () {
        if (this.index > -1) {
            zoneNameEdit.value = this.array[this.index].polygonInfo.Description;
            this.array[this.index].visibileMarkers(true);
            map.addListener("click", this.array[this.index].event_addPoint);
        }
    }

    this.remove = function () {
        if (this.index != -1) {
            this.array[this.index].removeServer();
            combobox[this.getIndexCB(this.array[this.index].polygonInfo.Id)] = null;
            this.array.splice(this.index, 1);
            this.index = -1;
            for (var i = 0; i < combobox.length; i++) {
                if (combobox[i].text === "All") {
                    combobox[i].selected = true;
                }
            }
            document.getElementById("btnEdit").style.display = "none";
            document.getElementById("btnRomove").style.display = "none";
        }
    }

    this.update = function () {
        combobox[this.getIndexCB(this.array[this.index].polygonInfo.Id)].text = zoneNameEdit.value;
        this.array[this.index].updateServer();
        map.removeListener("click", this.array[this.index].event_addPoint);
        this.array[this.index].visibileMarkers(false);
    }

    this.changePolygon = function () {
        this.index = this.getIndexPoly(combobox.value);
        for (var i = 0; i < this.array.length; i++) {
            if (i == this.index) {
                this.array[i].activityLineWidth(3);
                this.array[i].showTimeActive();
                document.getElementById("btnEdit").style.display = "block";
                document.getElementById("btnRomove").style.display = "block";
                document.getElementById("btnAddDevice").style.display = "block";
            }
            else if (this.array[i].lineWidth != 1 || this.index == -1) {
                this.array[i].activityLineWidth(1);
            }
        }
        if (this.index == -1) {
            zoomAllodj();
            document.getElementById("btnEdit").style.display = "none";
            document.getElementById("btnRomove").style.display = "none";
            document.getElementById("btnAddDevice").style.display = "none";
        }
        else
            map.zoomTo(this.array[this.index].poly.getBoundingBox());
    }

    this.getIndexCB = function (id) {
        for (var i = 0; i < combobox.length; i++) {
            if (combobox[i].value == id)
                return i;
        }
        return -1;
    }

    this.getIndexPoly = function (id) {
        for (var i = 0; i < this.array.length; i++) {
            if (this.array[i].polygonInfo.Id == id)
                return i;
        }
        return -1;
    }

    this.setTimeActivity = function () {
        var dayofweek = 0;
        Array.prototype.forEach.call(document.querySelectorAll('input[type=checkbox]'), function (ths) {
            if (ths.checked)
                dayofweek += parseInt(ths.value);
        });
        this.array[this.index].setTimeActivityServer(dayofweek, startTime.value, endTime.value);
    }

    this.activatedPolygon = function () {
        console.log("dfgfd");
        for (var i = 0; i < _this.array.length; i++) {
            for (var j = 0; j < _this.array[i].timeActivitys.length; j++) {
                if (IsDayOfWeek(_this.array[i].timeActivitys[j].DayOfWeek)) {
                    var s = new Date('1/30/1993 ' + _this.array[i].timeActivitys[j].StartTime);
                    var e = new Date('1/30/1993 ' + _this.array[i].timeActivitys[j].EndTime);
                    var n = new Date(); n.setDate(30); n.setMonth(0); n.setFullYear(1993);
                    if (s <= n && e >= n) {
                        _this.array[i].activityColor("#339A");
                    } else if (_this.array[i].color != "#39aA") {
                        _this.array[i].activityColor("#39aA");
                    }
                }
            }
        }
    }

    this.cancel = function () {
        if (this.temp != null) {
            map.removeListener("click", this.temp.event_addPoint);
            this.temp.remove();
            this.temp = null;
        } else {
            this.array[this.index].visibileMarkers(false);
            map.removeListener("click", this.array[this.index].event_addPoint);
        }
    }

    this.setDeviseZone = function () {
        this.array[this.index].setZoneDevice();
    }
};

var polygons = new PolygonCollection();
setInterval(polygons.activatedPolygon, 10000);
//////////////////Objects
function Polygon() {
    var _this = this;
    this.markers = [];
    this.path = [];
    this.timeActivitys = [];
    this.flagVM = false;
    this.color = "#39aA";
    this.lineWidth = 1;
    this.devices = [];

    this.drawing = function (eventCoord) {
        var coords = eventCoord;
        if (!(coords instanceof ovi.mapsapi.geo.Coordinate)) {
            coords = map.pixelToGeo(eventCoord.displayX, eventCoord.displayY);
        }
        var marker = new ovi.mapsapi.map.StandardMarker(coords, {
            draggable: true
        });
        if (_this.path.length > 2 && !(eventCoord instanceof ovi.mapsapi.geo.Coordinate)) {
            var pos = this.smartPoint(coords.latitude, coords.longitude);
            _this.path.splice(pos, 0, coords);
            _this.markers.splice(pos, 0, marker);
        }
        else {
            _this.path.push(coords);
            _this.markers.push(marker);
        }
        marker.addListener("dragend", function () {
            for (var i = 0, I = _this.markers.length; i < I && _this.markers[i] !== this; ++i);
            _this.path[i] = this.coordinate;
            _this.updatePolegon();
        });
        marker.addListener("click", function () {
            map.objects.remove(this);
            for (var i = 0, I = _this.markers.length; i < I && _this.markers[i] !== this; ++i);
            _this.markers.splice(i, 1);
            _this.path.splice(i, 1);
            _this.updatePolegon();
        });
        if (_this.flagVM) {
            map.objects.add(marker);
        }
    }

    this.createPolygon = function () {
        this.poly = new ovi.mapsapi.map.Polygon(this.path, {
            pen: { strokeColor: "#000", lineWidth: 1 },
            brush: { color: this.color }
        });
        map.objects.add(this.poly);
    }

    this.setPolygon = function () {
        if ("polygonInfo" in this) {
            var points = this.polygonInfo.Area.trim().trim(',').split(',');
            for (var j = 0; j < points.length - 1; j++) {
                var latlngStr = points[j].trim(' ').split(" ");
                var coord = new ovi.mapsapi.geo.Coordinate(parseFloat(latlngStr[0]), parseFloat(latlngStr[1]));
                this.drawing(coord);
            }
            this.updatePolegon();
        }
    }

    this.updatePolegon = function () {
        if (!("poly" in this)) {
            this.createPolygon();
        }
        else if (this.path.length > 0) {
            map.objects.remove(this.poly);
            var temp = new ovi.mapsapi.map.Polygon(this.path, {
                pen: { strokeColor: "#000", lineWidth: this.lineWidth },
                brush: { color: this.color }
            });
            temp.eventListener = this.poly.eventListener;
            this.poly.path = temp.path;
            this.poly.brush = temp.brush;
            this.poly.pen = temp.pen;
            this.poly._boundingBox = temp._boundingBox;
            map.objects.add(this.poly);
        }
    }

    this.visibileMarkers = function (flag) {
        this.flagVM = flag;
        if (!flag) {
            map.objects.removeAll(this.markers);
        }
        else {
            map.objects.addAll(this.markers);
            map.zoomTo(this.poly.getBoundingBox());
        }
    }

    this.saveServer = function () {
        if (this.path.length > 1) {
            var area = '';
            for (var i = 0; i < this.path.length; i++) {
                area += this.path[i].latitude + ' ' + this.path[i].longitude + ', ';
            }
            con.server.setZoneAsync(token, $('#zoneName').val(), area).done(function (info) {
                _this.polygonInfo = JSON.parse(info);
                _this.setTimeActivityServer(258, "00:00", "23:00");
                polygons.add(polygons.temp);
                polygons.temp = null;
            });
            this.visibileMarkers(false);
        }
    }

    this.updateServer = function () {
        if (this.path.length > 1 && "polygonInfo" in this) {
            var area = '';
            for (var i = 0; i < this.path.length; i++) {
                area += this.path[i].latitude + ' ' + this.path[i].longitude + ', ';
            }
            this.polygonInfo.Description = $('#zoneNameEdit').val();
            con.server.updateZoneAsync(this.polygonInfo.Id, $('#zoneNameEdit').val(), area).done(function (error) {
                console.log(error);
            });
        }
    }

    this.removeServer = function () {
        if ("polygonInfo" in this) {
            con.server.removeZoneAsync(this.polygonInfo.Id);
            this.remove();
            zoomAllodj();
        }
    }

    this.event_addPoint = function (event) {
        var object = event.target;
        if (!(object instanceof ovi.mapsapi.map.StandardMarker)) {
            _this.drawing(event);
            _this.updatePolegon();
        }
    }

    this.activityColor = function (color) {
        this.color = color;
        this.updatePolegon();
    }

    this.activityLineWidth = function (lineWidth) {
        this.lineWidth = lineWidth;
        this.updatePolegon();
    }

    this.showTimeActive = function () {
        Array.prototype.forEach.call(document.querySelectorAll('div[class="time-active"]'), function (ths) {
            ths.remove();
        });
        for (var i = 0; i < this.timeActivitys.length; i++) {
            console.log(this.timeActivitys[i].DayOfWeek);
            dateActive.innerHTML += "<div class='time-active' id='" + this.timeActivitys[i].Id + "' onclick='mouseEvent(this)'>Days: " + dayOfWeekToString(this.timeActivitys[i].DayOfWeek) +
                "<br/>Time: "
            + this.timeActivitys[i].StartTime + " - " + this.timeActivitys[i].EndTime + "<br/></div>";
        }
    }

    this.getTimeActiveServer = function () {
        if ("polygonInfo" in this) {
            con.server.getTimeActiveAsync(this.polygonInfo.Id).done(function (timeActive) {
                _this.timeActivitys = JSON.parse(timeActive);
                polygons.activatedPolygon();
            });
        }
    }

    this.setTimeActivityServer = function (_dayofweek, _startTime, _endTime) {
        con.server.setTimeActiveAsync(this.polygonInfo.Id, _dayofweek, _startTime, _endTime).done(function (timeAct) {
            _this.timeActivitys.push(JSON.parse(timeAct));
            _this.showTimeActive();
        });
    }

    this.removeTimeActivityServer = function (index) {
        con.server.removeTimeActiveAsync(this.timeActivitys[index].Id);
        this.timeActivitys.splice(index, 1);
    }

    this.remove = function () {
        map.objects.removeAll(this.markers);
        map.objects.remove(this.poly);
        this.markers = [];
        this.poly = null;
    }

    this.smartPoint = function (lat, lon) {
        var index;
        var min = 10000;
        for (var i = 0; i < this.path.length; i++) {
            var result;
            if (i === this.path.length - 1) {
                result = Math.sqrt(Math.pow(this.path[i].latitude - lat, 2) + Math.pow(this.path[i].longitude - lon, 2))
                + Math.sqrt(Math.pow(this.path[0].latitude - lat, 2) + Math.pow(this.path[0].longitude - lon, 2));
            }
            else {
                result = Math.sqrt(Math.pow(this.path[i].latitude - lat, 2) + Math.pow(this.path[i].longitude - lon, 2))
                    + Math.sqrt(Math.pow(this.path[i + 1].latitude - lat, 2) + Math.pow(this.path[i + 1].longitude - lon, 2));
            }
            if (min > result) {
                min = result;
                index = i + 1;
            }
        }
        return index;
    }

    this.addDevice = function () {
        con.server.getZoneDevice(this.polygonInfo.Id).done(function (zdevice) {
            _this.devices = JSON.parse(zdevice);
        });
    }

    this.setZoneDevice = function () {
        con.server.setZoneDeviceAsync(this.polygonInfo.Id, cbDevice.value).done(function (zdevice) {
            console.log(zdevice);
            _this.devices.push(JSON.parse(zdevice));
            
            for (var k = 0; k < devicesAll.length; k++) {
                if (devicesAll[k].Id == zdevice.Device_Id) {
                    devinfo.innerHTML += "<div>" + zdevice.Name + "</div>"
                }
            }
        });
    }
}

///////////////

function btnNewZone() {
    polygons.newZone();
    document.getElementById("control-zone").style.display = "none";
    document.getElementById("save-cancel").style.display = "block";
}

function btnEditZone() {
    polygons.edit();
    document.getElementById("control-zone2").style.display = "none";
    document.getElementById("control-zone").style.display = "none";
    document.getElementById("control-edit").style.display = "block";
    document.getElementById("timeActiveControl").style.display = "block";
}

function btnsave() {
    polygons.save();
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("save-cancel").style.display = "none";
}

function btncancel() {
    polygons.cancel();
    document.getElementById("control-zone2").style.display = "block";
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("save-cancel").style.display = "none";
    document.getElementById("control-edit").style.display = "none";
    document.getElementById("timeActiveControl").style.display = "none";
}

function btnRemove() {
    polygons.remove();
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("control-edit").style.display = "none";
    document.getElementById("timeActiveControl").style.display = "none";
}

function btnUpdate() {
    polygons.update();
    document.getElementById("control-zone2").style.display = "block";
    document.getElementById("control-zone").style.display = "block";
    document.getElementById("control-edit").style.display = "none";
    document.getElementById("timeActiveControl").style.display = "none";
}

$(function () {
    $.connection.hub.url = 'http://192.168.0.103:8080/Server/signalr';
    con = $.connection.connectionHub;
    con.client.newDeviceInfo = function (d_id, lon, lat, accuracy, dt, sos) {
        var pos = new ovi.mapsapi.geo.Coordinate(lat, lon);
        devicePos.addMarkerWith(pos, dt, accuracy);
    };
    con.client.chack = function (info, text) {
        console.log(info);
        windowInfo(text);
    };
    $.connection.hub.start().done(function () {
        con.server.subscriptionRenewalAsync($.cookie('tokenInfo')).done(function (user) {
            $('#monitoring').text(user);
        })
        getZone();
    });
});


function zoomAllodj() {
    console.log(IsDayOfWeek(64));
    Array.prototype.forEach.call(document.querySelectorAll('div[class="time-active"]'), function (ths) {
        ths.remove();
    });
    if (map.objects.getLength() > 0) {
        var allBoundingBox = new ovi.mapsapi.map.Container();
        for (var i = 0; i < map.objects.getLength() ; i++) {
            allBoundingBox.objects.add(map.objects.get(i));
        }
        map.zoomTo(allBoundingBox.getBoundingBox());
    }
}

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
}


function getDevice() {
    con.server.getDevice(token).done(function (json) {
        devicesAll = JSON.parse(json);
        for (var i = 0; i < devicesAll.length; i++) {
            var option = document.createElement('option');
            option.text = devicesAll[i].Name;
            option.value = devicesAll[i].Id;
            usrs.add(option);
            cbDevice.add(option);
        }
        enableUsrInfo();
        $('#usrs').click(function () {
            var selectedText = $(this).find("option:selected").text();
            for (var i = 0; i < devicesAll.length; i++) {
                if (selectedText == devicesAll[i].Name) {
                    inputTB.value = devicesAll[i].Name;
                    changeStartTime.value = devicesAll[i].Start;
                    changeEndTime.value = devicesAll[i].End;
                    document.getElementById("setActivity").value = devicesAll[i].Enable.toString();
                }
            }

        });
    });
}


function getZone() {
    con.server.getZoneAsync(token).done(function (zones_) {
        zoneInfo = JSON.parse(zones_);
        for (var i = 0; i < zoneInfo.length; i++) {
            var temp = new Polygon();
            temp.polygonInfo = zoneInfo[i];
            temp.setPolygon();
            temp.getTimeActiveServer();
            temp.addDevice();
            polygons.add(temp);
        }
        zoomAllodj();
        var option = document.createElement('option');
        option.text = "All";
        option.value = -1;
        option.selected = true;
        combobox.add(option);
        getDevice();
    });
}

function mouseEvent(obj) {
    Array.prototype.forEach.call(document.querySelectorAll('div[class="time-active"]'), function (ths) {
        ths.style.backgroundColor = 'rgb(224, 224, 209)';
    });
    obj.style.backgroundColor = '#cce5ff';
}

function removeTimeActive() {
    Array.prototype.forEach.call(document.querySelectorAll('div[class="time-active"]'), function (ths) {
        if (ths.style.backgroundColor == 'rgb(204, 229, 255)') {
            for (var i = 0; i < polygons.array[polygons.index].timeActivitys.length; i++) {
                console.log(polygons.array[polygons.index].timeActivitys[i].Id);
                if (polygons.array[polygons.index].timeActivitys[i].Id == ths.id) {
                    polygons.array[polygons.index].removeTimeActivityServer(i);
                }
            }
            ths.style.display = "none";
        }
    });
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
        if (bin[bin.length - i - 1] == 1) {
            if (activeDay === "")
                activeDay += days[i];
            else
                activeDay += ', ' + days[i];
        }
    }
    return activeDay;
}

function IsDayOfWeek(dow) {
    if (dow > 128) {
        return true;
    }
    var bin = dow.toString(2);
    var flag = false;
    for (var i = 0; i < bin.length; i++) {
        if (bin[bin.length - i - 1] == 1 && i == new Date().getDay()) {
            flag = true;
        }
    }
    return flag;
}


function zeroPadded(val) {
    if (val >= 10)
        return val;
    else
        return '0' + val;
}


var oldMarkerStart;
var oldMarkerEnd;
var array = [];
function Routs() {
    var pos = [];
    this.load = function () {
        con.server.getRoute(token, $('#timestart').val(), $('#timestop').val()).done(function (result) {
            clier();
            var routes = JSON.parse(result);
            pos = [];
            for (var i = 1; i < routes.length; i++) {
                var len = Math.sqrt(Math.pow(routes[i].Latitude - routes[i - 1].Latitude, 2) + Math.pow(routes[i].Longitude - routes[i - 1].Longitude, 2));
                if ((Math.abs(Date.parse(routes[i].DateTime) - Date.parse(routes[i - 1].DateTime)) > 5000) || (len > 0.05)) {
                    var r = new ovi.mapsapi.map.Polyline(
                                pos,
                                {
                                    pen: { strokeColor: "#22CA", lineWidth: 5 }
                                });
                    r.addListener("click", show);
                    map.objects.add(r);

                    var obj = {
                        polyline: r,
                        start: routes[i - pos.length],
                        end: routes[i - 1]
                    }
                    array.push(obj);
                    pos = [];
                }
                pos.push(new ovi.mapsapi.geo.Coordinate(routes[i].Latitude, routes[i].Longitude));
            }
        });
    }
}

 function clier() {
        for (var i = 0; i < array.length; i++) {
            map.objects.remove(array[i].polyline);
        }
        if (oldMarkerStart != null && oldMarkerEnd != null) {
            map.objects.remove(oldMarkerStart);
            map.objects.remove(oldMarkerEnd);
        }
    }
function show () {
        for (var i = 0; i < array.length; i++) {
            if (this == array[i].polyline) {
                if (oldMarkerStart != null && oldMarkerEnd != null) {
                    map.objects.remove(oldMarkerStart);
                    map.objects.remove(oldMarkerEnd);
                }
                var markerstart = new ovi.mapsapi.map.StandardMarker([array[i].start.Latitude, array[i].start.Longitude], {
                    text: "Start",
                    draggable: false
                });
                map.objects.add(markerstart);
                var markerend = new ovi.mapsapi.map.StandardMarker([array[i].end.Latitude, array[i].end.Longitude], {
                    text: "End",
                    draggable: false
                });
                map.objects.add(markerend);
                document.getElementById("route-data").innerHTML = "<h5>Start: " + array[i].start.DateTime + "<br /> End: " + array[i].end.DateTime + "</h5>";
                oldMarkerStart = markerstart;
                oldMarkerEnd = markerend;
            }
        }
    }
 


var routs = new Routs();

function DevicePosition() {

    var marker;
    var circle;

    this.drop = function () {
        con.server.getLastDeviceInfoAsync($.cookie('tokenInfo')).done(function (user) {
            var pos = new ovi.mapsapi.geo.Coordinate(JSON.parse(user).Latitude, JSON.parse(user).Longitude);
            addMarkerWith(pos, JSON.parse(user).DateTime, JSON.parse(user).Accuracy);
        })
    }

    this.addMarkerWith = function (position, name, accuracy) {
        if (marker != null)
            map.objects.remove(marker);
        if (circle != null)
            map.objects.remove(circle);
        marker = new ovi.mapsapi.map.Marker(
        position, {
            title: "marker",
            visibility: true,
        });
        circle = new ovi.mapsapi.map.Circle(
        position,
        accuracy,
        {
            pen: { strokeColor: "#2224", lineWidth: 2 },
            brush: { color: "#A4A7" }
        });
        map.objects.add(circle);
        map.objects.add(marker);
    }

}

var devicePos = new DevicePosition();





function enableZones() {
    document.getElementById("active-zone").style.display = "block";
    document.getElementById("active-rount").style.display = "none";
    document.getElementById("user-settings").style.display = "none";
}

function enableRouts() {
    var now = new Date();
    document.getElementById("timestart").value = now.getFullYear() + "-" + zeroPadded(now.getMonth()) + "-" + zeroPadded(now.getDate()) + "T" + now.getHours() + ":" + now.getMinutes();
    document.getElementById("timestop").value = now.getFullYear() + "-" + zeroPadded(now.getMonth() + 1) + "-" + zeroPadded(now.getDate()) + "T" + now.getHours() + ":" + now.getMinutes();
    document.getElementById("active-zone").style.display = "none";
    document.getElementById("active-rount").style.display = "block";
    document.getElementById("user-settings").style.display = "none";
}
function enableUserSettings() {
    document.getElementById("active-zone").style.display = "none";
    document.getElementById("active-rount").style.display = "none";
    document.getElementById("user-settings").style.display = "block";

    //getDevice();
    //document.getElementById("usrs").innerHTML = "<li><a href=\"#\">HTML</a></li>"
}
function enableUsrInfo() {
    document.getElementById("usrinfo").style.display = "block";

}
function setActivity() {
    var x = document.getElementById("setActivity").value;
    if (x == "true") {
        document.getElementById("setActivity").value = "false";
    }
    else {
        document.getElementById("setActivity").value = "true";
    }
}

function setSettings() {
    var x = document.getElementById("changeSettings").value;
    if (x == "Change Settings") {
        document.getElementById("changeStartTime").disabled = false;
        document.getElementById("changeEndTime").disabled = false;
        document.getElementById("inputTB").disabled = false;
        document.getElementById("setActivity").disabled = false;
        document.getElementById("changeSettings").value = "Set Settings";
    }
    else {
        con.server.setSettingDeviceAsync(usrs.value, inputTB.value, changeStartTime.value, changeEndTime.value, true).done(function (json) {
            con.server.setDeviceConfiguration(token);
            alert("ok");
        });
        document.getElementById("changeStartTime").disabled = true;
        document.getElementById("changeEndTime").disabled = true;
        document.getElementById("inputTB").disabled = true;
        document.getElementById("setActivity").disabled = true;
        document.getElementById("changeSettings").value = "Change Settings";
    }
}
function cancelSettings() {
    document.getElementById("changeStartTime").disabled = true;
    document.getElementById("changeEndTime").disabled = true;
    document.getElementById("inputTB").disabled = true;
    document.getElementById("setActivity").disabled = true;
    document.getElementById("changeSettings").value = "Change Settings";
}