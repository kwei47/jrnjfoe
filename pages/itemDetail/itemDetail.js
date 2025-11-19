const app = getApp();
const db = app.globalData.db;

Page({
    data: {
        // 和addItem页面数据结构一致，新增itemId存储当前物品ID
        itemId: "",
        itemName: "",
        categoryList: [],
        categoryIndex: 0,
        buyDate: "",
        remark: "",
        imgList: [],
    },

    onLoad(options) {
        const itemId = options.id; // 接收列表页传递的物品ID
        this.setData({ itemId });
        this.getCategoryList();
        this.getItemDetail(itemId); // 加载物品详情
    },

    // 获取物品详情
    getItemDetail(itemId) {
        db.collection("item")
            .doc(itemId)
            .get()
            .then((res) => {
                const item = res.data;
                // 匹配分类索引（根据categoryId）
                const categoryIndex = this.data.categoryList.findIndex(
                    (cat) => cat._id === item.categoryId,
                );
                this.setData({
                    itemName: item.name,
                    categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
                    buyDate: item.buyDate,
                    remark: item.remark,
                    imgList: item.imgList,
                });
            })
            .catch((err) => {
                wx.showToast({ title: "获取详情失败", icon: "none" });
            });
    },

    // 编辑提交（和addItem的submitItem逻辑类似，只是用update）
    submitEdit() {
        const {
            itemId,
            itemName,
            categoryList,
            categoryIndex,
            buyDate,
            remark,
            imgList,
        } = this.data;
        // 校验逻辑和addItem一致...

        db.collection("item")
            .doc(itemId)
            .update({
                data: {
                    name: itemName,
                    categoryId: categoryList[categoryIndex]._id,
                    categoryName: categoryList[categoryIndex].name,
                    buyDate,
                    remark,
                    imgList,
                    updateTime: db.serverDate(),
                },
            })
            .then(() => {
                wx.showToast({ title: "编辑成功" });
                wx.navigateBack();
            })
            .catch((err) => {
                wx.showToast({ title: "编辑失败", icon: "none" });
            });
    },

    // 删除物品
    deleteItem() {
        const { itemId } = this.data;
        wx.showModal({
            title: "提示",
            content: "确定要删除该物品记录吗？删除后不可恢复！",
            success: (res) => {
                if (res.confirm) {
                    db.collection("item")
                        .doc(itemId)
                        .remove()
                        .then(() => {
                            wx.showToast({ title: "删除成功" });
                            wx.navigateBack();
                        })
                        .catch((err) => {
                            wx.showToast({ title: "删除失败", icon: "none" });
                        });
                }
            },
        });
    },

    // 其他方法（inputItemName、changeCategory等）和addItem页面一致，直接复制
});
