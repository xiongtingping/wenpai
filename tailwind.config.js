/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class", "[data-theme='dark']"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: 'var(--container-padding-default)',
			screens: {
				'2xl': '1400px'
			}
		},
		// 🚀 统一响应式断点系统
		screens: {
			'xs': '475px',   // 超小屏幕
			'sm': '640px',   // 小屏幕
			'md': '768px',   // 平板
			'lg': '1024px',  // 笔记本
			'xl': '1280px',  // 桌面
			'2xl': '1536px', // 大桌面
			// 特殊断点
			'tall': { 'raw': '(min-height: 800px)' }, // 高屏幕
			'mobile-landscape': { 'raw': '(max-height: 500px) and (orientation: landscape)' }, // 手机横屏
		},
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Modern Flat + Soft Neumorphism 圆角系统（令牌化，无硬编码）
				xs: 'var(--radius-xs)',
				xl: 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				'3xl': 'var(--radius-3xl)',
				full: 'var(--radius-full)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				// Section background for neutral separators (not emphasis)
				section: {
					DEFAULT: 'hsl(var(--section))',
					foreground: 'hsl(var(--section-foreground))'
				},
				// Strong border color for higher contrast dividers
				strong: 'hsl(var(--border-strong))',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},

			},
			// Modern Flat + Soft Neumorphism 阴影系统
			boxShadow: {
				none: 'none',
				sm: 'var(--shadow-sm)',
				md: 'var(--shadow-md)',
				lg: 'var(--shadow-lg)',
				xl: 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
				// Neumorphism 扩展强度层
				'e0': 'var(--shadow-e0)',
				'e1': 'var(--shadow-e1)',
				'e2': 'var(--shadow-e2)',
				'glow': 'var(--shadow-glow)',
				'glow-secondary': 'var(--shadow-glow-secondary)',
				'glow-accent': 'var(--shadow-glow-accent)',
				'inset-soft': 'var(--inset-soft)',
				'inset-deep': 'var(--inset-deep)',
				'highlight': 'var(--highlight)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					from: { 
						opacity: '0',
						transform: 'translateY(20px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fadeIn': 'fadeIn 0.8s ease-out forwards'
			},
			fontSize: {
				xs: 'var(--font-size-xs)',
				sm: 'var(--font-size-sm)',
				base: 'var(--font-size-base)',
				lg: 'var(--font-size-lg)',
				xl: 'var(--font-size-xl)',
				'2xl': 'var(--font-size-2xl)',
				'3xl': 'var(--font-size-3xl)',
				'4xl': 'var(--font-size-4xl)'
			},
			fontWeight: {
				normal: 'var(--font-weight-normal)',
				medium: 'var(--font-weight-medium)',
				semibold: 'var(--font-weight-semibold)',
				bold: 'var(--font-weight-bold)'
			},
			lineHeight: {
				tight: 'var(--line-height-tight)',
				snug: 'var(--line-height-snug)',
				normal: 'var(--line-height-normal)',
				relaxed: 'var(--line-height-relaxed)'
			},
			letterSpacing: {
				tight: 'var(--letter-spacing-tight)',
				normal: 'var(--letter-spacing-normal)',
				wide: 'var(--letter-spacing-wide)'
			},
			spacing: {
				'0': 'var(--spacing-0)',
				'0.5': 'var(--spacing-0-5)',
				'1': 'var(--spacing-1)',
				'1.5': 'var(--spacing-1-5)',
				'2': 'var(--spacing-2)',
				'2.5': 'var(--spacing-2-5)',
				'3': 'var(--spacing-3)',
				'4': 'var(--spacing-4)',
				'5': 'var(--spacing-5)',
				'6': 'var(--spacing-6)',
				'8': 'var(--spacing-8)',
				'10': 'var(--spacing-10)',
				'12': 'var(--spacing-12)',
				'16': 'var(--spacing-16)'
			},
			fontFamily: {
				sans: ['var(--font-family-sans)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}