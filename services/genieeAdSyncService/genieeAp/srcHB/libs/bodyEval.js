function bodyEval(body_el) {
  // Finds and executes scripts in a newly added element's body.
  // Needed since innerHTML does not run scripts.
  //
  // Argument body_el is an element in the dom.

  function nodeName(elem, name) {
    return elem.nodeName && elem.nodeName.toUpperCase() ===
              name.toUpperCase();
  }

  function evalScript(elem) {
    var data = (elem.text || elem.textContent || elem.innerHTML || "" ),
        head = document.getElementsByTagName("head")[0] ||
                  document.documentElement,
        script = document.createElement("script");

    script.type = "text/javascript";
    try {
      // doesn't work on ie...
      script.appendChild(document.createTextNode(data));
    } catch(e) {
      // IE has funky script nodes
      script.text = data;
    }

    head.insertBefore(script, head.firstChild);
    head.removeChild(script);
  }

  // main section of function
  var scripts = [],
      script,
      children_nodes = body_el.childNodes,
      child,
      i;

  for (i = 0; children_nodes[i]; i++) {
    child = children_nodes[i];
    if (nodeName(child, "script" ) &&
      (!child.type || child.type.toLowerCase() === "text/javascript")) {
          scripts.push(child);
      }
  }

  for (i = 0; scripts[i]; i++) {
    script = scripts[i];
    if (script.parentNode) {script.parentNode.removeChild(script);}
    evalScript(scripts[i]);
  }
}

module.exports = bodyEval;