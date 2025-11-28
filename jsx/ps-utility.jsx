function getDocumentDir() {
    return app.activeDocument.path.fsName;
}

function getDocumentPath() {
    return app.activeDocument.fullName.fsName;
}

$.writeln("getDocumentDir: " + getDocumentDir());
$.writeln("getDocumentPath: " + getDocumentPath());
