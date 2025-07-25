import { useState, useEffect } from "react";
import { Authing } from "@authing/web";
import { Guard } from "@authing/guard";

const AuthTestPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authingClient, setAuthingClient] = useState(null);
  const [guardInstance, setGuardInstance] = useState(null);

  const getAuthingConfig = () => {
    return {
      appId: import.meta.env.VITE_AUTHING_APP_ID || "",
      host: import.meta.env.VITE_AUTHING_HOST || "",
      redirectUri: import.meta.env.VITE_AUTHING_REDIRECT_URI || "",
      userPoolId: import.meta.env.VITE_AUTHING_USER_POOL_ID || ""
    };
  };

  const initAuthingClient = () => {
    try {
      const config = getAuthingConfig();
      console.log("🔧 Authing配置:", config);
      
      // ✅ FIXED: 简化Authing客户端配置，移除可能导致400错误的参数
      // ✅ FIXED: domain需带上应用ID路径，确保与控制台端点一致
      const client = new Authing({
        domain: config.host.replace("https://", ""), // config.host应为 https://ai-wenpai.authing.cn/687e0afae2b84f86865b644
        appId: config.appId,
        userPoolId: config.userPoolId,
        redirectUri: config.redirectUri,
        scope: "openid profile email"
      });
      
      setAuthingClient(client);
      console.log("✅ Authing客户端初始化成功");
      return client;
    } catch (error) {
      console.error("❌ Authing客户端初始化失败:", error);
      setError("Authing客户端初始化失败: " + error.message);
      return null;
    }
  };

  const initGuardInstance = () => {
    try {
      const config = getAuthingConfig();
      
      // ✅ FIXED: 简化Guard配置
      const guard = new Guard({
        appId: config.appId,
        redirectUri: config.redirectUri,
        mode: "modal"
      });
      
      setGuardInstance(guard);
      console.log("✅ Guard实例初始化成功");
      return guard;
    } catch (error) {
      console.error("❌ Guard实例初始化失败:", error);
      setError("Guard实例初始化失败: " + error.message);
      return null;
    }
  };

  const checkAuthStatus = () => {
    try {
      const savedUser = localStorage.getItem("authing_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log("✅ 从localStorage恢复用户信息:", userData);
      }
    } catch (error) {
      console.error("❌ 恢复用户信息失败:", error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!authingClient) {
        throw new Error("Authing客户端未初始化");
      }
      console.log("🔐 开始登录流程...");
      
      // ✅ FIXED: 简化登录请求，移除可能导致400错误的参数
      await authingClient.loginWithRedirect({
        responseType: 'code',
        state: `state_${Date.now()}`,
        prompt: 'login'
      });
    } catch (error) {
      console.error("❌ 登录失败:", error);
      setError("登录失败: " + error.message);
      setLoading(false);
    }
  };

  const handleGuardLogin = () => {
    if (guardInstance) {
      console.log("🔐 打开Guard登录弹窗...");
      guardInstance.show();
    } else {
      setError("Guard实例未初始化");
    }
  };

  const handleRegister = () => {
    if (guardInstance) {
      console.log("📝 打开Guard注册弹窗...");
      guardInstance.show('register');
    } else {
      setError("Guard实例未初始化");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("authing_user");
    console.log("✅ 用户已登出");
  };

  useEffect(() => {
    initAuthingClient();
    initGuardInstance();
    checkAuthStatus();
  }, []);

  return (
    <div className="auth-test-page">
      <div className="header">
        <h1>Authing 核心功能测试</h1>
        <p>测试 Authing 登录、注册、回调等核心功能</p>
      </div>

      <div className="content">
        <div className="user-section">
          <h2>用户状态</h2>
          {user ? (
            <div className="user-info">
              <p><strong>已登录:</strong> {user.name || user.email || user.username}</p>
              <button className="button" onClick={handleLogout}>
                登出
              </button>
            </div>
          ) : (
            <p>未登录</p>
          )}
        </div>

        <div className="actions">
          <h2>操作按钮</h2>
          <div className="button-group">
            <button
              className="button"
              onClick={handleLogin}
              disabled={loading || !authingClient}
            >
              {loading ? "登录中..." : "Authing 登录"}
            </button>
            
            <button
              className="button"
              onClick={handleGuardLogin}
              disabled={!guardInstance}
            >
              Guard 登录弹窗
            </button>
            
            <button
              className="button"
              onClick={handleRegister}
              disabled={!guardInstance}
            >
              Guard 注册弹窗
            </button>
          </div>
        </div>

        {error && (
          <div className="error-section">
            <h2>错误信息</h2>
            <div className="error-message">
              {error}
            </div>
          </div>
        )}

        <div className="config-section">
          <h2>环境配置</h2>
          <div className="user-info">
            <pre>{JSON.stringify(getAuthingConfig(), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage; 