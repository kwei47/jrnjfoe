const app = getApp();
const db = app.globalData.db;

Page({
    data: {
        itemList: [], // 物品列表
        categoryList: [], // 分类列表（用于筛选）
        filterCategoryIndex: 0, // 筛选分类索引（0=全部）
    },

    // 页面加载时获取数据
    onLoad() {
        this.getCategoryList();
        this.getItemList();
    },

    // 下拉刷新
    onPullDownRefresh() {
        this.getItemList(() => {
            wx.stopPullDownRefresh();
        });
    },

    // 上拉加载更多（可选，个人使用暂时不需要，数据量小时无需分页）
    onReachBottom() {
        // 后续可扩展分页逻辑
    },

    // 获取分类列表（筛选用，在全部分类前加“全部”选项）
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

    // 获取物品列表（支持筛选）
    getItemList(callback) {
        const { filterCategoryIndex, categoryList } = this.data;
        // 筛选条件：全部分类（0）或指定分类
        let whereCondition = {};
        if (filterCategoryIndex > 0) {
            const selectedCategory = categoryList[filterCategoryIndex - 1];
            whereCondition = { categoryId: selectedCategory._id };
        }

        // 从云数据库查询物品（按创建时间倒序，最新的在前）
        db.collection("item")
            .where(whereCondition)
            .orderBy("createTime", "desc")
            .get()
            .then((res) => {
                this.setData({ itemList: res.data });
                callback && callback();
            })
            .catch((err) => {
                wx.showToast({ title: "获取物品失败", icon: "none" });
                console.error(err);
            });
    },

    // 切换筛选分类
    changeFilterCategory(e) {
        this.setData({ filterCategoryIndex: e.detail.value });
        this.getItemList(); // 重新获取筛选后的物品列表
    },

    // 跳转到物品详情页
    goToDetail(e) {
        const itemId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/itemDetail/itemDetail?id=${itemId}`,
        });
    },
});
