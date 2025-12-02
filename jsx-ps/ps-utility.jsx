function getDocumentDir() {
    return app.activeDocument.path.fsName;
}

function getDocumentPath() {
    return app.activeDocument.fullName.fsName;
}

/**
 * 创建 剪切蒙版
 */
function createClippingMask() {
    // =======================================================
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt"),
    );
    desc1.putReference(charIDToTypeID("null"), ref1);
    executeAction(charIDToTypeID("GrpL"), desc1, DialogModes.NO);
}

/**
 * 释放 剪切蒙版
 */
function releaseClippingMask() {
    // =======================================================
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt"),
    );
    desc1.putReference(charIDToTypeID("null"), ref1);
    executeAction(charIDToTypeID("Ungr"), desc1, DialogModes.NO);
}

/**
 * 创建 色阶 调整图层
 * @param {*} params
 * @param params.list2 输入色阶数组 [黑场, 白场]
 * @param params.gmm 伽马值
 */
function createLevelsAdjustmentLayer(params) {
    // =======================================================
    // 创建调整图层
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putClass(charIDToTypeID("AdjL"));
    desc1.putReference(charIDToTypeID("null"), ref1);
    var desc2 = new ActionDescriptor();
    var desc3 = new ActionDescriptor();
    desc3.putEnumerated(
        stringIDToTypeID("presetKind"),
        stringIDToTypeID("presetKindType"),
        stringIDToTypeID("presetKindDefault"),
    );
    desc2.putObject(charIDToTypeID("Type"), charIDToTypeID("Lvls"), desc3);
    desc1.putObject(charIDToTypeID("Usng"), charIDToTypeID("AdjL"), desc2);
    executeAction(charIDToTypeID("Mk  "), desc1, DialogModes.NO);
    // =======================================================
    // 设置参数
    var desc4 = new ActionDescriptor();
    var ref2 = new ActionReference();
    ref2.putEnumerated(
        charIDToTypeID("AdjL"),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt"),
    );
    desc4.putReference(charIDToTypeID("null"), ref2);
    var desc5 = new ActionDescriptor();
    desc5.putEnumerated(
        stringIDToTypeID("presetKind"),
        stringIDToTypeID("presetKindType"),
        stringIDToTypeID("presetKindCustom"),
    );
    var list1 = new ActionList();
    var desc6 = new ActionDescriptor();
    var ref3 = new ActionReference();
    ref3.putEnumerated(
        charIDToTypeID("Chnl"),
        charIDToTypeID("Chnl"),
        charIDToTypeID("Cmps"),
    );
    desc6.putReference(charIDToTypeID("Chnl"), ref3);
    var list2 = new ActionList();
    list2.putInteger(params.list2[0]);
    list2.putInteger(params.list2[1]);
    desc6.putList(charIDToTypeID("Inpt"), list2);
    desc6.putDouble(charIDToTypeID("Gmm "), params.gmm);
    list1.putObject(charIDToTypeID("LvlA"), desc6);
    desc5.putList(charIDToTypeID("Adjs"), list1);
    desc4.putObject(charIDToTypeID("T   "), charIDToTypeID("Lvls"), desc5);
    executeAction(charIDToTypeID("setd"), desc4, DialogModes.NO);
    // =======================================================
    // 裁剪到下方图层
    var desc7 = new ActionDescriptor();
    var ref7 = new ActionReference();
    ref7.putEnumerated(
        charIDToTypeID("Lyr "),
        charIDToTypeID("Ordn"),
        charIDToTypeID("Trgt"),
    );
    desc7.putReference(charIDToTypeID("null"), ref7);
    executeAction(charIDToTypeID("GrpL"), desc7, DialogModes.NO);
}
