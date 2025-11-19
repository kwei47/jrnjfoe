App({
    onLaunch() {
        if (!wx.cloud) {
            console.error(
                "Please use WeChat base library 2.2.3 or above to use cloud capabilities",
            );
        } else {
            wx.cloud.init({
                env: "your-cloud-environment-id",
                traceUser: true,
            });
        }

        this.globalData = {
            db: wx.cloud.database(),
        };
    },
});
