import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh'
    }
  },
  lang: 'zh-CN',
  title: "EUQI",
  titleTemplate: ':title - Ray\'s blog',
  description: "A blog site",
  base: '/vitepress/',
  head: [
    ['link', { rel: 'icon', href: '/vitepress/favicon.png' }],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ],
    [
      'script',
      { id: 'register-sw' },
      `;(() => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js')
        }
      })()`
    ],
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-CB7DEN2H2V' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-CB7DEN2H2V');
      gtag('consent', 'default', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      });`
    ],
  ],
  srcExclude: ['**/README.md', '**/TODO.md'],
  outDir: '../vitepress',
  ignoreDeadLinks: true,
  lastUpdated: true,

  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    },
    image: {
      // 默认禁用；设置为 true 可为所有图片启用懒加载。
      lazyLoading: true
    },
    math: true
  },

  themeConfig: {
    logo: '/logo.svg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '杂记', link: '/vitepress/example' },
      { text: '分组', 
        items: [
          { text: 'Angular', link: '/Angular/Angular Component' },
          { text: 'Git', link: '/Git/Git设置镜像' },
          { text: 'Jetson', link: '/Jetson/Jetson TX2设置自动登录' },
          { text: 'vitepress', link: '/vitepress/example' },
          { text: '编程指导思想', link: '/编程指导思想/编程范式' },
        ]
      }
    ],

    // sidebar: [
    //   {
    //     text: 'VitePress',
    //     items: [
    //       { text: 'Vitepress 搭建', link: '/vitepress/VitePress搭建' },
    //       { text: '模版', link: '/vitepress/example' }
    //     ]
    //   }
    // ],

    sidebar: generateSidebar({
      // 侧边栏的根目录，默认为docs
      documentRootPath: "/docs",
      // 使用h1的标题作为侧边栏的标题
      useTitleFromFileHeading: true,
      // 使用文件夹的index.md
      useFolderTitleFromIndexFile: true,
      // 指向文件夹的链接
      useFolderLinkFromIndexFile: true,
      // 根据md文件的order进行排序
      sortMenusByFrontmatterOrder: true,
      // 排序之后将不是文件夹的放后面
      sortFolderTo: "top",
      // 菜单展开功能
      collapsed: false,
    }),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sdboy' }
    ],

    editLink: {
      // pattern: ({ filePath }) => {
      //   if (filePath.startsWith('/')) {
      //     return `https://github.com/sdboy/vitepress/edit/main/${filePath}`
      //   } else {
      //     return `https://github.com/sdboy/vitepress/edit/main/docs/${filePath}`
      //   }
      // },
      pattern: 'https://github.com/sdboy/vitepress/edit/main/docs/:path',
      text: '编辑此页'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },

    footer: {
      message: '基于<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">CC BY-NC-SA 4.0</a>协议进行许可',
      copyright: 'Copyright © 2022-2025 Ray'
    },

    search: {
      provider: 'local'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outlineTitle: "页面内容",
    // 返回顶部 Return to top
    returnToTopLabel: "返回顶部",

    // 菜单  Menu
    sidebarMenuLabel: "菜单",
    //头上角要主题切换的文字 Appearance
    darkModeSwitchLabel: "切换主题",
  }
})
