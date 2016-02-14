function CheckCookie() {
    var token = $.cookie('tokenInfo');
    if ((token == null)) {
        window.location.replace("/Acount/Login");
    }
}