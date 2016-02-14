function windowInfo(text)
{
    document.getElementById("windowText").innerText = text;
    document.getElementById("window").style.display = "block";
}

function destroy()
{
    document.getElementById("window").style.display = "none";
}