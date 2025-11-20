Array.prototype.filter =
    Array.prototype.filter ||
    function (callback, thisArg) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            if (i in this) {
                if (callback.call(thisArg, this[i], i, this)) {
                    result.push(this[i]);
                }
            }
        }
        return result;
    };

function main() {
    var items = app.activeDocument.selection;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var bounds = item.visibleBounds;
        var colors = getColors(item);

        $.writeln("colors: " + colors.length);

        var group = app.activeDocument.groupItems.add();
        drawColors(group, colors, bounds[0], bounds[3] - 20);
    }
}

function getColors(item) {
    var colors = [];

    if (item.typename === "GroupItem") {
        for (var i = 0; i < item.pageItems.length; i++) {
            colors = colors.concat(getColors(item.pageItems[i]));
        }
    } else if (item.typename === "CompoundPathItem") {
        for (var j = 0; j < item.pathItems.length; j++) {
            colors = colors.concat(getColors(item.pathItems[j]));
        }
    } else {
        if (item.filled && item.fillColor) {
            colors.push({
                type: "fill",
                color: item.fillColor,
                text: getColorText(item.fillColor),
            });
        }

        if (item.stroked && item.strokeColor) {
            colors.push({
                type: "stroke",
                color: item.strokeColor,
                text: getColorText(item.strokeColor),
            });
        }
    }

    // 去重
    var uniqueColors = {};
    colors = colors.filter(function (colorInfo) {
        var key = colorInfo.text;
        if (uniqueColors[key]) {
            return false;
        } else {
            uniqueColors[key] = true;
            return true;
        }
    });

    return colors;
}

function getColorText(color) {
    if (color.typename === "RGBColor") {
        return (
            "RGB(" +
            Math.round(color.red) +
            ", " +
            Math.round(color.green) +
            ", " +
            Math.round(color.blue) +
            ")"
        );
    } else if (color.typename === "CMYKColor") {
        return (
            "CMYK(" +
            Math.round(color.cyan) +
            ", " +
            Math.round(color.magenta) +
            ", " +
            Math.round(color.yellow) +
            ", " +
            Math.round(color.black) +
            ")"
        );
    } else if (color.typename === "SpotColor") {
        return "Spot(" + color.spot.name + ")";
    } else if (color.typename === "GrayColor") {
        return "Gray(" + Math.round(color.gray) + ")";
    } else {
        return color.typename;
    }
}

function drawColors(group, colors, beginX, beginY) {
    for (var i = 0; i < colors.length; i++) {
        var colorInfo = colors[i];
        var rect = group.pathItems.rectangle(beginY - i * 20, beginX, 18, 18);
        rect.filled = true;
        rect.fillColor = colorInfo.color;
        rect.stroked = false;

        var text = group.textFrames.pointText([beginX + 20, beginY - i * 20]);
        text.contents = colorInfo.text;
        text.textRange.characterAttributes.size = 8;
        text.top = rect.top - rect.height / 2 + text.height / 2;
    }
}

try {
    main();
} catch (e) {
    $.writeln("Error: " + e.message);
}
