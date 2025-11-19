const app = getApp();
const db = app.globalData.db;

Page({
    data: {
        itemName: "", // 物品名称
        categoryList: [], // 分类列表（从category集合获取）
        categoryIndex: 0, // 选中的分类索引
        buyDate: "", // 购买日期
        remark: "", // 备注
        imgList: [], // 上传的图片URL数组
    },

    // 页面加载时获取分类列表
    onLoad() {
        this.getCategoryList();
    },

    // 获取分类列表（和分类管理页面共用逻辑）
    getCategoryList() {
        db.collection("category")
            .get()
            .then((res) => {
                this.setData({ categoryList: res.data });
            })
            .catch((err) => {
                wx.showToast({ title: "获取分类失败", icon: "none" });
            });
    },

    // 输入物品名称
    inputItemName(e) {
        this.setData({ itemName: e.detail.value.trim() });
    },

    // 选择分类
    changeCategory(e) {
        this.setData({ categoryIndex: e.detail.value });
    },

    // 选择购买日期
    changeBuyDate(e) {
        this.setData({ buyDate: e.detail.value });
    },

    // 输入备注
    inputRemark(e) {
        this.setData({ remark: e.detail.value.trim() });
    },

    // 选择图片（从相册/相机）
    chooseImg() {
        wx.chooseImage({
            count: 3 - this.data.imgList.length, // 最多上传3张
            sourceType: ["album", "camera"], // 相册+相机
            success: (res) => {
                // 上传图片到云存储
                const tempFilePaths = res.tempFilePaths;
                tempFilePaths.forEach((tempPath) => {
                    // 生成唯一的图片文件名（避免重复）
                    const cloudPath = `itemImgs/${new Date().getTime()}-${Math.random() * 1000}.png`;
                    wx.cloud.uploadFile({
                        cloudPath,
                        fileContent: fs.readFileSync(tempPath), // 注意：微信开发者工具需开启「本地设置→增强编译」
                        success: (uploadRes) => {
                            // 保存云存储的图片URL
                            const imgUrl = uploadRes.fileID;
                            this.setData({
                                imgList: [...this.data.imgList, imgUrl],
                            });
                        },
                        fail: (err) => {
                            wx.showToast({
                                title: "图片上传失败",
                                icon: "none",
                            });
                        },
                    });
                });
            },
        });
    },

    // 预览图片
    previewImg(e) {
        const index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: this.data.imgList[index],
            urls: this.data.imgList,
        });
    },

    // 删除图片
    deleteImg(e) {
        const index = e.currentTarget.dataset.index;
        const imgList = this.data.imgList;
        imgList.splice(index, 1);
        this.setData({ imgList });
    },

    // 提交物品信息到云数据库
    submitItem() {
        const {
            itemName,
            categoryList,
            categoryIndex,
            buyDate,
            remark,
            imgList,
        } = this.data;
        if (!itemName) {
            wx.showToast({ title: "物品名称不能为空", icon: "none" });
            return;
        }
        if (categoryList.length === 0 || !categoryList[categoryIndex]) {
            wx.showToast({ title: "请选择分类", icon: "none" });
            return;
        }

        // 构造物品数据
        const itemData = {
            name: itemName,
            categoryId: categoryList[categoryIndex]._id, // 分类ID（关联category集合）
            categoryName: categoryList[categoryIndex].name, // 分类名称（冗余存储，方便查询）
            buyDate,
            remark,
            imgList, // 图片URL数组
            createTime: db.serverDate(), // 服务器时间（避免本地时间偏差）
            updateTime: db.serverDate(),
        };

        // 插入到云数据库
        db.collection("item")
            .add({ data: itemData })
            .then(() => {
                wx.showToast({ title: "添加成功" });
                // 跳转回物品列表页
                wx.navigateBack({ delta: 1 });
            })
            .catch((err) => {
                wx.showToast({ title: "添加失败", icon: "none" });
                console.error(err);
            });
    },
});
