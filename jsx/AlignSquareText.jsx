// 检查是否有文档打开，如果没有则创建一个
if (app.documents.length == 0) {
    app.documents.add();
}

var doc = app.activeDocument;

// --- 参数设置 ---
var squareSize = 18; // 正方形大小 (pt)
var gap = 10; // 正方形与文字的间距 (pt)
var textContent = "示例文本"; //生成的文字内容
var startX = 100; // 起始 X 坐标
var startY = 400; // 起始 Y 坐标

// --- 1. 创建正方形 ---
// rectangle(top, left, width, height)
// 注意：Illustrator 脚本中，Y轴向上为正，但创建矩形时通常用 Top 作为定位基准
var rect = doc.pathItems.rectangle(startY, startX, squareSize, squareSize);

// 给正方形填个色方便看
var rectColor = new RGBColor();
rectColor.red = 0;
rectColor.green = 120;
rectColor.blue = 255;
rect.fillColor = rectColor;
rect.stroked = false;

// --- 2. 创建文本 ---
var textFrame = doc.textFrames.add();
textFrame.contents = textContent;

// 设置字体大小（可选，为了视觉平衡）
textFrame.textRange.characterAttributes.size = 12;

// --- 3. 水平定位 (放在正方形右侧) ---
textFrame.left = rect.left + rect.width + gap;

// --- 4. 垂直定位 (核心：上下居中对齐) ---
// 逻辑：让文本的中心点 Y 坐标 = 正方形的中心点 Y 坐标
// 公式推导：
// SquareCenterY = rect.top - (rect.height / 2)
// TextTop = SquareCenterY + (textFrame.height / 2)

var squareCenterY = rect.top - rect.height / 2;
textFrame.top = squareCenterY + textFrame.height / 2;

// 刷新视图
app.redraw();
