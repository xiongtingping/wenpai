/**
 * 隐私政策页面
 * 针对AI内容创作和适配工具的文派平台隐私政策
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Database, Eye, Lock, Users, Brain, Mail, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 返回到首页底部
  const handleBackToHome = () => {
    navigate('/', { state: { scrollToFooter: true } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* 返回按钮 */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-primary hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {t('privacy.title')}
              </CardTitle>
              <p className="text-primary font-medium">{t('privacy.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t('privacy.lastUpdated')}: {t('privacy.updateDate')}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {t('privacy.version')}: v2.0
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed mt-3">
            {t('privacy.description')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
              <Database className="h-5 w-5 text-primary" />
              {t('privacy.sections.dataCollection.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <h4 className="font-medium mb-2 text-foreground">{t('privacy.sections.dataCollection.accountInfo.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>{t('privacy.sections.dataCollection.accountInfo.registration')}:</strong> {t('privacy.sections.dataCollection.accountInfo.registrationDesc')}</li>
                  <li><strong>{t('privacy.sections.dataCollection.accountInfo.profile')}:</strong> {t('privacy.sections.dataCollection.accountInfo.profileDesc')}</li>
                  <li><strong>{t('privacy.sections.dataCollection.accountInfo.verification')}:</strong> {t('privacy.sections.dataCollection.accountInfo.verificationDesc')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-foreground">{t('privacy.sections.dataCollection.usageData.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>{t('privacy.sections.dataCollection.usageData.functionality')}:</strong> {t('privacy.sections.dataCollection.usageData.functionalityDesc')}</li>
                  <li><strong>{t('privacy.sections.dataCollection.usageData.content')}:</strong> {t('privacy.sections.dataCollection.usageData.contentDesc')}</li>
                  <li><strong>{t('privacy.sections.dataCollection.usageData.platformAdapt')}:</strong> {t('privacy.sections.dataCollection.usageData.platformAdaptDesc')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-foreground">{t('privacy.sections.dataCollection.technicalData.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>{t('privacy.sections.dataCollection.technicalData.device')}:</strong> {t('privacy.sections.dataCollection.technicalData.deviceDesc')}</li>
                  <li><strong>{t('privacy.sections.dataCollection.technicalData.network')}:</strong> {t('privacy.sections.dataCollection.technicalData.networkDesc')}</li>
                  <li><strong>{t('privacy.sections.dataCollection.technicalData.logs')}:</strong> {t('privacy.sections.dataCollection.technicalData.logsDesc')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {t('privacy.sections.dataUsage.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                {(t('privacy.sections.dataUsage.purposes', { returnObjects: true }) as any[]).map((purpose: any, index: number) => (
                  <li key={index}>{purpose}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('privacy.sections.dataSharing.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="p-4 rounded-lg border bg-card border-border">
                <p className="font-medium text-foreground mb-2">{t('privacy.sections.dataSharing.noSalePromise')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('privacy.sections.dataSharing.noSaleDesc')}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('privacy.sections.dataSharing.necessarySharing.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t('privacy.sections.dataSharing.necessarySharing.payment')}</li>
                  <li>{t('privacy.sections.dataSharing.necessarySharing.cloud')}</li>
                  <li>{t('privacy.sections.dataSharing.necessarySharing.ai')}</li>
                  <li>{t('privacy.sections.dataSharing.necessarySharing.support')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('privacy.sections.dataSharing.legal.title')}</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>{t('privacy.sections.dataSharing.legal.disclosure')}</li>
                  <li>{t('privacy.sections.dataSharing.legal.protection')}</li>
                  <li>{t('privacy.sections.dataSharing.legal.cooperation')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              4. 数据安全措施
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>加密传输：</strong>使用HTTPS和SSL加密保护数据传输</li>
                <li><strong>加密存储：</strong>敏感数据使用强加密算法存储</li>
                <li><strong>访问控制：</strong>严格的员工权限管理和访问控制</li>
                <li><strong>安全审计：</strong>定期进行安全评估和漏洞扫描</li>
                <li><strong>数据备份：</strong>定期备份数据，确保数据安全</li>
                <li><strong>监控系统：</strong>实时监控异常访问和安全威胁</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">{t('privacy.sections.dataRetention.title')}</h3>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                {(t('privacy.sections.dataRetention.periods', { returnObjects: true }) as any[]).map((period: any, index: number) => (
                  <li key={index}>{period}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {t('privacy.sections.userRights.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">{t('privacy.sections.userRights.basicRights.title')}</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>{t('privacy.sections.userRights.basicRights.access')}</li>
                    <li>{t('privacy.sections.userRights.basicRights.correction')}</li>
                    <li>{t('privacy.sections.userRights.basicRights.deletion')}</li>
                    <li>{t('privacy.sections.userRights.basicRights.portability')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">6.2 控制权利</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>限制权：</strong>限制我们处理您的信息</li>
                    <li><strong>反对权：</strong>反对某些处理活动</li>
                    <li><strong>撤回权：</strong>撤回之前给予的同意</li>
                    <li><strong>投诉权：</strong>向监管部门投诉</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">7. Cookie和追踪技术</h3>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>必要Cookie：</strong>用于网站基本功能和安全</li>
                <li><strong>功能Cookie：</strong>记住您的偏好设置</li>
                <li><strong>分析Cookie：</strong>帮助我们改进服务质量</li>
                <li><strong>第三方Cookie：</strong>仅用于必要的第三方服务</li>
                <li>您可以在浏览器设置中管理Cookie偏好</li>
                <li>我们不会使用第三方追踪Cookie进行广告投放</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">8. 儿童隐私保护</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="p-4 rounded-lg border bg-accent border-border">
                <p className="font-medium text-foreground mb-2">重要提醒</p>
                <p className="text-sm text-muted-foreground">
                  我们的服务不面向13岁以下的儿童。如果您发现我们收集了儿童信息，请立即联系我们。
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>我们不会故意收集13岁以下儿童的个人信息</li>
                <li>如果发现收集了儿童信息，会立即删除</li>
                <li>家长或监护人如发现相关问题，请及时联系我们</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">9. 国际数据传输</h3>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>您的数据可能在中国境外进行处理</li>
                <li>我们确保所有数据传输符合适用的数据保护法律</li>
                <li>我们采用适当的安全措施保护跨境数据</li>
                <li>我们与第三方服务商签订数据处理协议</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">10. 政策更新</h3>
            <div className="space-y-3 text-muted-foreground">
              <ul className="list-disc pl-6 space-y-2">
                <li>我们可能会不时更新本隐私政策</li>
                <li>重大变更会通过邮件、网站公告或应用内通知</li>
                <li>继续使用服务即表示您接受更新后的政策</li>
                <li>如不同意修改内容，请停止使用服务并联系我们</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              11. 联系我们
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p>如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：</p>
              <div className="p-4 rounded-lg border bg-card border-border">
                <ul className="space-y-2 text-sm">
                  <li>• <strong>隐私保护邮箱：</strong><a href="mailto:hello@wenpai.xyz" className="text-primary hover:underline ml-1">hello@wenpai.xyz</a></li>
                  <li>• <strong>客服邮箱：</strong><a href="mailto:hello@wenpai.xyz" className="text-primary hover:underline ml-1">hello@wenpai.xyz</a></li>

                  <li>• <strong>工作时间：</strong>周一至周五 9:00-18:00</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="border-t pt-6 p-4 rounded-lg border-border">
            <h4 className="font-medium text-foreground mb-2">我们的承诺</h4>
            <p className="text-sm text-muted-foreground">
              我们承诺保护您的隐私，并持续改进我们的隐私保护措施。您的信任是我们最重要的资产。
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}