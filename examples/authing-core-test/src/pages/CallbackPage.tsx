import { useState, useEffect } from "react";
import { Authing } from "@authing/web";

const CallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log("🔄 开始处理OIDC回调...");
      
      // ✅ FIXED: domain需带上应用ID路径，确保与控制台端点一致
      const client = new Authing({
        domain: "ai-wenpai.authing.cn/687e0afae2b84f86865b644",
        appId: "687e0afae2b84f86865b644",
        userPoolId: "687e0a47a9c1c3d9177b8da1",
        redirectUri: "http://localhost:3001/callback"
      });

      console.log("✅ Authing客户端初始化成功");

      // 处理重定向回调
      const userInfo = await client.handleRedirectCallback();
      console.log("✅ 回调处理成功:", userInfo);

      if (userInfo) {
        // 保存用户信息
        const userData = {
          id: userInfo.id || userInfo.userId,
          name: userInfo.name || userInfo.nickname,
          email: userInfo.email,
          username: userInfo.username,
          loginTime: new Date().toISOString()
        };

        setUser(userData);
        localStorage.setItem("authing_user", JSON.stringify(userData));
        console.log("✅ 用户信息已保存:", userData);

        // 重定向到主页
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        throw new Error("未获取到用户信息");
      }
    } catch (error) {
      console.error("❌ 回调处理失败:", error);
      setError("回调处理失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="callback-page">
        <div className="loading">
          <h2>处理登录回调中...</h2>
          <p>请稍候，正在验证您的登录信息...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="callback-page">
        <div className="error">
          <h2>登录失败</h2>
          <p className="error-message">{error}</p>
          <button 
            className="button" 
            onClick={() => window.location.href = "/"}
          >
            返回主页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-page">
      <div className="success">
        <h2>登录成功！</h2>
        {user && (
          <div className="user-info">
            <p><strong>欢迎回来:</strong> {user.name || user.email || user.username}</p>
            <p>正在跳转到主页...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackPage; 