import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthing } from '@/hooks/useAuthing';
import PermissionGuard from '@/components/auth/PermissionGuard';

/**
 * 权限测试页面
 * 用于演示权限控制功能
 */
const PermissionTestPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthing();
  const {
    roles,
    permissions,
    loading,
    error,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
    checkPermissions,
    refreshPermissions,
  } = usePermissions();

  /**
   * 处理无权限回调
   */
  const handleNoPermission = (missingPermissions: any[], missingRoles: string[]) => {
    console.log('权限不足:', { missingPermissions, missingRoles });
    alert(`权限不足！\n缺少权限: ${missingPermissions.map(p => `${p.resource}:${p.action}`).join(', ')}\n缺少角色: ${missingRoles.join(', ')}`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1890ff', textAlign: 'center', marginBottom: '30px' }}>
        权限控制测试页面
      </h1>

      {/* 用户状态 */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h2>用户状态</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><strong>登录状态:</strong> {isLoggedIn ? '已登录' : '未登录'}</div>
          <div><strong>权限加载:</strong> {loading ? '加载中...' : '完成'}</div>
          <div><strong>用户信息:</strong> {user ? '已获取' : '未获取'}</div>
          <div><strong>错误信息:</strong> {error || '无'}</div>
        </div>
        
        {user && (
          <div style={{ 
            background: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '5px',
            marginTop: '15px',
            border: '1px solid #4caf50'
          }}>
            <h3>用户信息</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 权限信息 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>权限信息</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 角色信息 */}
          <div>
            <h3>用户角色 ({roles.length})</h3>
            {roles.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {roles.map((role, index) => (
                  <li key={index} style={{ 
                    padding: '8px 12px', 
                    background: '#f0f0f0', 
                    margin: '5px 0', 
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <strong>{role.name}</strong> ({role.code})
                    {role.description && <div style={{ fontSize: '12px', color: '#666' }}>{role.description}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>暂无角色</p>
            )}
          </div>

          {/* 权限信息 */}
          <div>
            <h3>用户权限 ({permissions.length})</h3>
            {permissions.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {permissions.map((permission, index) => (
                  <li key={index} style={{ 
                    padding: '8px 12px', 
                    background: '#e6f7ff', 
                    margin: '5px 0', 
                    borderRadius: '4px',
                    border: '1px solid #91d5ff'
                  }}>
                    <strong>{permission.resource}</strong>:{permission.action}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>暂无权限</p>
            )}
          </div>
        </div>

        <button 
          onClick={refreshPermissions}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#1890ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          刷新权限信息
        </button>
      </div>

      {/* 权限测试 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>权限测试</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* 基础权限测试 */}
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>基础权限测试</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>content:read:</strong> {hasPermission('content', 'read') ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>content:create:</strong> {hasPermission('content', 'create') ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>payment:create:</strong> {hasPermission('payment', 'create') ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>admin:all:</strong> {hasPermission('admin', 'all') ? '✅' : '❌'}
            </div>
          </div>

          {/* 角色测试 */}
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>角色测试</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>普通用户:</strong> {hasRole('普通用户') ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>高级用户:</strong> {hasRole('高级用户') ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>管理员:</strong> {hasRole('管理员') ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>任意高级角色:</strong> {hasAnyRole(['高级用户', '管理员']) ? '✅' : '❌'}
            </div>
          </div>

          {/* 组合权限测试 */}
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>组合权限测试</h3>
            <div style={{ marginBottom: '10px' }}>
              <strong>任意内容权限:</strong> {hasAnyPermission([
                { resource: 'content', action: 'read' },
                { resource: 'content', action: 'create' }
              ]) ? '✅' : '❌'}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>所有内容权限:</strong> {hasAllPermissions([
                { resource: 'content', action: 'read' },
                { resource: 'content', action: 'create' }
              ]) ? '✅' : '❌'}
            </div>
          </div>
        </div>
      </div>

      {/* 权限保护组件测试 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>权限保护组件测试</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* 有权限的内容 */}
          <div style={{ border: '1px solid #4caf50', padding: '15px', borderRadius: '5px', background: '#f1f8e9' }}>
            <h3>有权限的内容</h3>
            <PermissionGuard
              requiredPermissions={[{ resource: 'content', action: 'read' }]}
              onNoPermission={handleNoPermission}
            >
              <div style={{ padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                <p>✅ 这个内容需要 content:read 权限，您有权限查看！</p>
                <button style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}>
                  查看内容
                </button>
              </div>
            </PermissionGuard>
          </div>

          {/* 无权限的内容 */}
          <div style={{ border: '1px solid #f44336', padding: '15px', borderRadius: '5px', background: '#ffebee' }}>
            <h3>无权限的内容</h3>
            <PermissionGuard
              requiredPermissions={[{ resource: 'admin', action: 'all' }]}
              onNoPermission={handleNoPermission}
            >
              <div style={{ padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                <p>这个内容需要 admin:all 权限</p>
              </div>
            </PermissionGuard>
          </div>

          {/* 角色权限测试 */}
          <div style={{ border: '1px solid #ff9800', padding: '15px', borderRadius: '5px', background: '#fff3e0' }}>
            <h3>角色权限测试</h3>
            <PermissionGuard
              requiredRoles={['管理员']}
              onNoPermission={handleNoPermission}
            >
              <div style={{ padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                <p>✅ 这个内容需要管理员角色，您有权限查看！</p>
                <button style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#ff9800', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}>
                  管理员功能
                </button>
              </div>
            </PermissionGuard>
          </div>

          {/* 组合权限测试 */}
          <div style={{ border: '1px solid #9c27b0', padding: '15px', borderRadius: '5px', background: '#f3e5f5' }}>
            <h3>组合权限测试</h3>
            <PermissionGuard
              requiredPermissions={[{ resource: 'content', action: 'create' }]}
              requiredRoles={['高级用户']}
              mode="any"
              onNoPermission={handleNoPermission}
            >
              <div style={{ padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                <p>✅ 这个内容需要 content:create 权限或高级用户角色，您有权限查看！</p>
                <button style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#9c27b0', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}>
                  高级功能
                </button>
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div style={{ 
        background: '#e6f7ff', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #91d5ff'
      }}>
        <h3>使用说明</h3>
        <ul>
          <li><strong>基础权限测试:</strong> 测试单个权限和角色的检查功能</li>
          <li><strong>组合权限测试:</strong> 测试多个权限和角色的组合检查</li>
          <li><strong>权限保护组件:</strong> 演示如何使用 PermissionGuard 组件保护内容</li>
          <li><strong>权限模式:</strong> 'all' 模式需要所有权限，'any' 模式需要任意权限</li>
          <li><strong>自定义回调:</strong> 可以通过 onNoPermission 回调处理无权限情况</li>
        </ul>
      </div>
    </div>
  );
};

export default PermissionTestPage; 