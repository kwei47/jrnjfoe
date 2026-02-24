function degrees(n) {
    return n * (180 / Math.PI);
}
/**
 *
 * @param {number} n
 * @returns number
 */
function radians(n) {
    return n * (Math.PI / 180);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
function hpF(x, y) {
    // (7)
    if (x === 0 && y === 0) return 0;
    else {
        const tmphp = degrees(Math.atan2(x, y));
        if (tmphp >= 0) return tmphp;
        else return tmphp + 360;
    }
}

/**
 *
 * @param {number} C1
 * @param {number} C2
 * @param {number} h1p
 * @param {number} h2p
 * @returns {number}
 */
function dhpF(C1, C2, h1p, h2p) {
    // (10)
    if (C1 * C2 === 0) return 0;
    else if (Math.abs(h2p - h1p) <= 180) return h2p - h1p;
    else if (h2p - h1p > 180) return h2p - h1p - 360;
    else if (h2p - h1p < -180) return h2p - h1p + 360;
    else throw new Error();
}

/**
 *
 * @param {number} C1
 * @param {number} C2
 * @param {number} h1p
 * @param {number} h2p
 * @returns {number}
 */
function aHpF(C1, C2, h1p, h2p) {
    // (14)
    if (C1 * C2 === 0) return h1p + h2p;
    else if (Math.abs(h1p - h2p) <= 180) return (h1p + h2p) / 2.0;
    else if (Math.abs(h1p - h2p) > 180 && h1p + h2p < 360)
        return (h1p + h2p + 360) / 2.0;
    else if (Math.abs(h1p - h2p) > 180 && h1p + h2p >= 360)
        return (h1p + h2p - 360) / 2.0;
    else throw new Error();
}
/**
 * Returns c converted to labcolor. Uses bc as background color,
 * defaults to using white as background color. Defaults to
 * any color without an alpha channel being specified is treated
 * as fully opaque (A=1.0)
 * @param {RGBAColor} c
 * @param {RGBAColor} [bc]
 * @return {LabColor} c converted to LabColor
 */
function rgbaToLab(c, bc) {
    bc = normalize(bc || { R: 255, G: 255, B: 255 });
    c = normalize(c);
    let newC = c;

    if (c.A !== undefined) {
        newC = {
            R: bc.R + (c.R - bc.R) * c.A,
            G: bc.G + (c.G - bc.G) * c.A,
            B: bc.B + (c.B - bc.B) * c.A,
        };
    }

    return xyzToLab(rgbToXyz(newC));
}

/**
 * Returns c converted to XYZColor
 * @param {RGBAColorUc} c
 * @return {XYZColor} c
 */
function rgbToXyz(c) {
    // Based on http://www.easyrgb.com/index.php?X=MATH&H=02
    let R = c.R / 255;
    let G = c.G / 255;
    let B = c.B / 255;

    if (R > 0.04045) R = Math.pow((R + 0.055) / 1.055, 2.4);
    else R = R / 12.92;
    if (G > 0.04045) G = Math.pow((G + 0.055) / 1.055, 2.4);
    else G = G / 12.92;
    if (B > 0.04045) B = Math.pow((B + 0.055) / 1.055, 2.4);
    else B = B / 12.92;

    R *= 100;
    G *= 100;
    B *= 100;

    // Observer. = 2°, Illuminant = D65
    const X = R * 0.4124 + G * 0.3576 + B * 0.1805;
    const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    const Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
    return { X, Y, Z };
}

/**
 * Returns c converted to LabColor.
 * @param {XYZColor} c
 * @return {LabColor} c converted to LabColor
 */
function xyzToLab(c) {
    // Based on http://www.easyrgb.com/index.php?X=MATH&H=07
    const refY = 100.0;
    const refZ = 108.883;
    const refX = 95.047; // Observer= 2°, Illuminant= D65
    let Y = c.Y / refY;
    let Z = c.Z / refZ;
    let X = c.X / refX;
    if (X > 0.008856) X = Math.pow(X, 1 / 3);
    else X = 7.787 * X + 16 / 116;
    if (Y > 0.008856) Y = Math.pow(Y, 1 / 3);
    else Y = 7.787 * Y + 16 / 116;
    if (Z > 0.008856) Z = Math.pow(Z, 1 / 3);
    else Z = 7.787 * Z + 16 / 116;
    const L = 116 * Y - 16;
    const a = 500 * (X - Y);
    const b = 200 * (Y - Z);
    return { L, a, b };
}

/**
 * @param {RGBAColor} c
 * @returns {RGBAColorUc}
 */
function normalize(c) {
    let r, g, b, a;
    if ("R" in c) {
        r = c.R;
        g = c.G;
        b = c.B;
        a = c.A;
    } else {
        r = c.r;
        g = c.g;
        b = c.b;
        a = c.a;
    }

    /** @type {RGBAColorUc} */
    const normalizedC = { R: r, G: g, B: b };

    if (a !== undefined) normalizedC.A = a;
    return normalizedC;
}
function colorDiff(c1, c2, bc) {
    if ("R" in c1 || "r" in c1) {
        c1 = rgbaToLab(c1, bc);
    }

    if ("R" in c2 || "r" in c2) {
        c2 = rgbaToLab(c2, bc);
    }
    /**
     * Implemented as in "The CIEDE2000 Color-Difference Formula:
     * Implementation Notes, Supplementary Test Data, and Mathematical Observations"
     * by Gaurav Sharma, Wencheng Wu and Edul N. Dalal.
     */

    // Get L,a,b values for color 1
    const L1 = c1.L;
    const a1 = c1.a;
    const b1 = c1.b;

    // Get L,a,b values for color 2
    const L2 = c2.L;
    const a2 = c2.a;
    const b2 = c2.b;

    // Weight factors
    const kL = 1;
    const kC = 1;
    const kH = 1;

    /**
     * Step 1: Calculate C1p, C2p, h1p, h2p
     */
    const C1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2)); // (2)
    const C2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2)); // (2)

    const aC1C2 = (C1 + C2) / 2.0; // (3)

    const G =
        0.5 *
        (1 -
            Math.sqrt(
                Math.pow(aC1C2, 7.0) /
                    (Math.pow(aC1C2, 7.0) + Math.pow(25.0, 7.0)),
            )); // (4)

    const a1p = (1.0 + G) * a1; // (5)
    const a2p = (1.0 + G) * a2; // (5)

    const C1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2)); // (6)
    const C2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2)); // (6)

    const h1p = hpF(b1, a1p); // (7)
    const h2p = hpF(b2, a2p); // (7)

    /**
     * Step 2: Calculate dLp, dCp, dHp
     */
    const dLp = L2 - L1; // (8)
    const dCp = C2p - C1p; // (9)

    const dhp = dhpF(C1, C2, h1p, h2p); // (10)
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(radians(dhp) / 2.0); // (11)

    /**
     * Step 3: Calculate CIEDE2000 Color-Difference
     */
    const aL = (L1 + L2) / 2.0; // (12)
    const aCp = (C1p + C2p) / 2.0; // (13)

    const aHp = aHpF(C1, C2, h1p, h2p); // (14)
    const T =
        1 -
        0.17 * Math.cos(radians(aHp - 30)) +
        0.24 * Math.cos(radians(2 * aHp)) +
        0.32 * Math.cos(radians(3 * aHp + 6)) -
        0.2 * Math.cos(radians(4 * aHp - 63)); // (15)
    const dRo = 30 * Math.exp(-Math.pow((aHp - 275) / 25, 2)); // (16)
    const RC = Math.sqrt(
        Math.pow(aCp, 7.0) / (Math.pow(aCp, 7.0) + Math.pow(25.0, 7.0)),
    ); // (17)
    const SL =
        1 +
        (0.015 * Math.pow(aL - 50, 2)) / Math.sqrt(20 + Math.pow(aL - 50, 2.0)); // (18)
    const SC = 1 + 0.045 * aCp; // (19)
    const SH = 1 + 0.015 * aCp * T; // (20)
    const RT = -2 * RC * Math.sin(radians(2 * dRo)); // (21)
    const dE = Math.sqrt(
        Math.pow(dLp / (SL * kL), 2) +
            Math.pow(dCp / (SC * kC), 2) +
            Math.pow(dHp / (SH * kH), 2) +
            RT * (dCp / (SC * kC)) * (dHp / (SH * kH)),
    ); // (22)
    return dE;
}

var rgbToArr = (rgbColor) => {
    if (!rgbColor) {
        return false;
    }
    let rgbaValues = rgbColor
        .substring(rgbColor.indexOf("(") + 1, rgbColor.lastIndexOf(")"))
        .split(",");
    // 将字符串转换为数字，并存储到数组中
    return rgbaValues.map(function (value) {
        return parseFloat(value.trim());
    });
};

var getContext = function (width, height) {
    var canvas = new OffscreenCanvas(width, height);
    return canvas.getContext("2d");
};
var getImageData = function (src, scale) {
    return new Promise(async (resolve) => {
        if (scale === void 0) scale = 1;
        const response = await fetch(src);
        const blob = await response.blob();
        const img = await createImageBitmap(blob);
        var width = img.width * scale;
        var height = img.height * scale;
        var context = getContext(width, height);
        context.drawImage(img, 0, 0, width, height);
        var ref = context.getImageData(0, 0, width, height);
        var data = ref.data;
        resolve({
            data,
            pixelCount: width * height,
        });
    });
};

var removeSimilarColors = function (colors) {
    for (let i = 0; i < colors.length; i++) {
        const color1 = rgbToArr(colors[i].color);
        for (let j = i + 1; j < colors.length; j++) {
            const color2 = rgbToArr(colors[j].color);
            const diff = colorDiff(
                { r: color1[0], g: color1[1], b: color1[2] },
                { r: color2[0], g: color2[1], b: color2[2] },
            );

            if (diff <= 15) {
                // 累加 count
                colors[i].count += colors[j].count;
                // 删除相似颜色
                colors.splice(j, 1);
                j--; // 防止跳过下一个
            }
        }
    }
    return colors;
};

var getCounts = function (data, ignoreArr) {
    var countMap = {};

    for (var i = 0; i < data.length; i += 4) {
        var alpha = data[i + 3];
        if (alpha === 0) {
            continue;
        }
        var rgbComponents = Array.from(data.subarray(i, i + 3));
        if (rgbComponents.indexOf(undefined) !== -1) {
            continue;
        }
        var color =
            alpha && alpha !== 255
                ? "rgba(" + rgbComponents.concat([alpha]).join(",") + ")"
                : "rgb(" + rgbComponents.join(",") + ")";
        if (ignoreArr.indexOf(color) !== -1) {
            continue;
        }

        if (countMap[color]) {
            countMap[color].count++;
        } else {
            countMap[color] = {
                color: color,
                count: 1,
            };
        }
    }

    var counts = Object.values(countMap);
    return counts.sort(function (a, b) {
        return b.count - a.count;
    });
};

var defaultOpts = {
    ignoreArr: [],
    scale: 1,
    keepCount: "",
    removeSimilarColors: false,
    thresholdRatio: 0,
};
var analyze = function (src, opts) {
    if (opts === void 0) opts = defaultOpts;

    try {
        opts = Object.assign({}, defaultOpts, opts);
        var ignoreArr = opts.ignoreArr;
        var scale = opts.scale;

        if (scale > 1 || scale <= 0) {
            console.warn(
                "You set scale to " +
                    scale +
                    ", which isn't between 0-1. This is either pointless (> 1) or a no-op (≤ 0)",
            );
        }
        return Promise.resolve(getImageData(src, scale)).then(function (res) {
            let { data, pixelCount } = res;
            let countThreshold = Math.floor(pixelCount * opts.thresholdRatio);
            countThreshold = Math.max(countThreshold, 1); // 确保阈值至少为1
            //获取颜色信息
            let colorData = getCounts(data, ignoreArr);
            //移除相似色
            if (opts.removeSimilarColors) {
                colorData = removeSimilarColors(colorData);
            }
            //根据keepCount保留几种主色
            colorData = colorData.slice(0, opts.keepCount);
            const total = colorData.reduce((a, b) => a + b.count, 0);

            //返回颜色数量大于阈值的颜色
            return colorData.filter((item) => item.count / total > 0.03);
        });
    } catch (e) {
        return Promise.reject(e);
    }
};

self.addEventListener("message", (event) => {
    let { url } = event.data;
    analyze(url, {
        scale: 1,
        ...event.data,
    }).then((res) => {
        self.postMessage(res);
    });
});
