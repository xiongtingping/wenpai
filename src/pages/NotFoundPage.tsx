import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, RefreshCw, MessageCircle, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function NotFoundPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 主要错误卡片 */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-primary"></span>
            </div>
            <CardTitle className="text-2xl text-foreground"></CardTitle>
            <p className="text-muted-foreground">
              
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 主要操作按钮 */}
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              
            </Button>
            
            {/* 建议操作 */}
            <div className="pt-4">
              <h4 className="font-medium text-foreground mb-3"></h4>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="justify-start"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/')}
                  className="justify-start"
                >
                  <Home className="w-4 h-4 mr-2" />
                  
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="justify-start"
                >
                  <a href="mailto:hello@wenpai.xyz">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 帮助提示 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2"></p>
                <ul className="space-y-1 text-xs">
                  <li>• {t('errors.notFoundPage.suggestions.checkUrl')}</li>
                  <li>• </li>
                  <li>• {t('errors.notFoundPage.suggestions.contactUs')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NotFoundPage
