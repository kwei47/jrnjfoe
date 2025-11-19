const app = getApp();
const db = app.globalData.db;

Page({
    data: {
        categoryList: [], // 分类列表
        isModalHidden: true, // 弹窗是否隐藏
        modalTitle: "新增分类", // 弹窗标题
        currentCategoryName: "", // 当前输入的分类名称
        currentCategoryId: "", // 编辑时的分类ID
    },

    // 页面加载时获取所有分类
    onLoad() {
        this.getCategoryList();
    },

    // 下拉刷新时重新获取分类
    onPullDownRefresh() {
        this.getCategoryList(() => {
            wx.stopPullDownRefresh(); // 停止下拉刷新动画
        });
    },

    // 从云数据库获取分类列表
    getCategoryList(callback) {
        db.collection("category")
            .orderBy("createTime", "desc")
            .get()
            .then((res) => {
                this.setData({ categoryList: res.data });
                callback && callback();
            })
            .catch((err) => {
                wx.showToast({ title: "获取分类失败", icon: "none" });
                console.error(err);
            });
    },

    // 显示新增分类弹窗
    showAddCategoryModal() {
        this.setData({
            isModalHidden: false,
            modalTitle: "新增分类",
            currentCategoryName: "",
            currentCategoryId: "",
        });
    },

    // 输入分类名称
    inputCategoryName(e) {
        this.setData({ currentCategoryName: e.detail.value.trim() });
    },

    // 确认新增/编辑分类
    confirmCategory() {
        const name = this.data.currentCategoryName;
        if (!name) {
            wx.showToast({ title: "分类名称不能为空", icon: "none" });
            return;
        }

        // 编辑分类（有currentCategoryId则是编辑）
        if (this.data.currentCategoryId) {
            // 编辑分类
            db.collection("category")
                .doc(this.data.currentCategoryId)
                .update({ data: { name } })
                .then(() => {
                    wx.showToast({ title: "编辑成功" });
                    this.getCategoryList();
                    this.setData({ isModalHidden: true });
                })
                .catch((err) => {
                    wx.showToast({ title: "编辑失败", icon: "none" });
                });
        } else {
            // 新增分类
            db.collection("category")
                .add({ data: { name, createTime: db.serverDate() } })
                .then(() => {
                    wx.showToast({ title: "新增成功" });
                    this.getCategoryList();
                    this.setData({ isModalHidden: true });
                })
                .catch((err) => {
                    wx.showToast({ title: "新增失败", icon: "none" });
                });
        }
    },

    // 取消弹窗
    cancelCategory() {
        this.setData({ isModalHidden: true });
    },

    // 编辑分类（触发弹窗）
    editCategory(e) {
        const item = e.currentTarget.dataset.item;
        this.setData({
            isModalHidden: false,
            modalTitle: "编辑分类",
            currentCategoryName: item.name,
            currentCategoryId: item._id,
        });
    },

    // 删除分类（注意：如果有物品关联该分类，需先删除物品或修改分类）
    deleteCategory(e) {
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: "提示",
            content: "删除后关联的物品会失去分类，是否确认删除？",
            success: (res) => {
                if (res.confirm) {
                    db.collection("category")
                        .doc(id)
                        .remove()
                        .then(() => {
                            wx.showToast({ title: "删除成功" });
                            this.getCategoryList();
                        })
                        .catch((err) => {
                            wx.showToast({ title: "删除失败", icon: "none" });
                        });
                }
            },
        });
    },
});
