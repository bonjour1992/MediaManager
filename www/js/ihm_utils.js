
//---------------------------------utils
Element.prototype._add_elem = function (tag,attributes,position)
{
    var e =document.createElement(tag);
	if (attributes){
		for (var a in attributes)
		{
			e.setAttribute(a,attributes[a]);
		}
	}
    if (position && this.childNodes.length > position )
    {
        this.insertBefore(e,this.childNodes[position]);
    }
    else
    {
        this.appendChild(e);
    }

    return e ;
}

Element.prototype._write = function (content,overwrite)
{
    if (overwrite)
    {
        this._clean();
    }
    this.appendChild(document.createTextNode(content));
    return this;
}

Element.prototype._clean = function()
{
    while ( this.firstChild)
    {
        this.removeChild(this.firstChild)
    }
    return this;
}

_get = function(id)
{
    return document.getElementById(id);
}




