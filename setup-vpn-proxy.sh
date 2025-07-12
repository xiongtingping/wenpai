#!/bin/bash

# VPN和代理配置脚本
# 用于解决OpenAI API网络连接问题

echo "🔧 OpenAI API网络连接配置工具"
echo "=================================="

# 检查是否安装了必要的工具
check_tools() {
    echo "🔍 检查必要工具..."
    
    if command -v curl &> /dev/null; then
        echo "✅ curl 已安装"
    else
        echo "❌ curl 未安装，请先安装curl"
        exit 1
    fi
    
    if command -v ping &> /dev/null; then
        echo "✅ ping 已安装"
    else
        echo "❌ ping 未安装"
        exit 1
    fi
}

# 测试网络连接
test_network() {
    echo "🔍 测试网络连接..."
    
    # 测试基础网络
    if ping -c 3 8.8.8.8 &> /dev/null; then
        echo "✅ 基础网络连接正常"
    else
        echo "❌ 基础网络连接异常"
        return 1
    fi
    
    # 测试DNS
    if ping -c 3 api.openai.com &> /dev/null; then
        echo "✅ DNS解析正常"
        return 0
    else
        echo "❌ DNS解析异常"
        return 1
    fi
}

# 配置代理
setup_proxy() {
    echo "🔧 配置代理设置..."
    
    read -p "请输入代理服务器地址 (例如: http://proxy.example.com:8080): " proxy_url
    
    if [ -n "$proxy_url" ]; then
        export HTTP_PROXY="$proxy_url"
        export HTTPS_PROXY="$proxy_url"
        export http_proxy="$proxy_url"
        export https_proxy="$proxy_url"
        
        echo "✅ 代理环境变量已设置:"
        echo "   HTTP_PROXY=$HTTP_PROXY"
        echo "   HTTPS_PROXY=$HTTPS_PROXY"
        
        # 测试代理连接
        echo "🔍 测试代理连接..."
        if curl -x "$proxy_url" -m 10 https://api.openai.com/v1/models &> /dev/null; then
            echo "✅ 代理连接成功"
            return 0
        else
            echo "❌ 代理连接失败"
            return 1
        fi
    else
        echo "❌ 未提供代理地址"
        return 1
    fi
}

# 配置VPN
setup_vpn() {
    echo "🔧 VPN配置建议..."
    echo ""
    echo "由于网络环境限制，建议使用以下VPN服务之一："
    echo ""
    echo "1. 商业VPN服务："
    echo "   - ExpressVPN"
    echo "   - NordVPN"
    echo "   - Surfshark"
    echo "   - CyberGhost"
    echo ""
    echo "2. 自建VPN："
    echo "   - V2Ray"
    echo "   - Shadowsocks"
    echo "   - WireGuard"
    echo ""
    echo "3. 临时解决方案："
    echo "   - 使用手机热点"
    echo "   - 更换网络环境"
    echo ""
    
    read -p "是否已配置VPN？(y/n): " vpn_configured
    
    if [ "$vpn_configured" = "y" ] || [ "$vpn_configured" = "Y" ]; then
        echo "🔍 测试VPN连接..."
        if test_network; then
            echo "✅ VPN连接正常"
            return 0
        else
            echo "❌ VPN连接异常"
            return 1
        fi
    else
        echo "请先配置VPN服务"
        return 1
    fi
}

# 测试OpenAI API
test_openai_api() {
    echo "🔍 测试OpenAI API连接..."
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "❌ 未设置OPENAI_API_KEY环境变量"
        return 1
    fi
    
    if curl -H "Authorization: Bearer $OPENAI_API_KEY" \
           -m 10 https://api.openai.com/v1/models &> /dev/null; then
        echo "✅ OpenAI API连接成功"
        return 0
    else
        echo "❌ OpenAI API连接失败"
        return 1
    fi
}

# 生成启动脚本
generate_startup_script() {
    echo "📝 生成启动脚本..."
    
    cat > start-with-proxy.sh << 'EOF'
#!/bin/bash

# 代理启动脚本
# 使用此脚本启动开发服务器

# 设置代理（请根据实际情况修改）
export HTTP_PROXY="http://your-proxy-server:port"
export HTTPS_PROXY="http://your-proxy-server:port"
export http_proxy="http://your-proxy-server:port"
export https_proxy="http://your-proxy-server:port"

# 设置API密钥
export OPENAI_API_KEY="your-api-key-here"

echo "🚀 使用代理启动开发服务器..."
node dev-api-server.js
EOF

    chmod +x start-with-proxy.sh
    echo "✅ 启动脚本已生成: start-with-proxy.sh"
    echo "请编辑脚本中的代理地址和API密钥"
}

# 主菜单
main_menu() {
    echo ""
    echo "请选择操作："
    echo "1. 测试网络连接"
    echo "2. 配置代理"
    echo "3. VPN配置建议"
    echo "4. 测试OpenAI API"
    echo "5. 生成启动脚本"
    echo "6. 退出"
    echo ""
    
    read -p "请输入选项 (1-6): " choice
    
    case $choice in
        1)
            test_network
            ;;
        2)
            setup_proxy
            ;;
        3)
            setup_vpn
            ;;
        4)
            test_openai_api
            ;;
        5)
            generate_startup_script
            ;;
        6)
            echo "👋 再见！"
            exit 0
            ;;
        *)
            echo "❌ 无效选项"
            ;;
    esac
}

# 主程序
main() {
    check_tools
    
    echo ""
    echo "当前网络状态："
    test_network
    
    while true; do
        main_menu
        echo ""
        read -p "按回车键继续..."
    done
}

# 运行主程序
main 