const routes: RouteConfig[] = [
  {
    key: 'Home',
    path: '/',
    redirect: { to: '/main' },
    windowOptions: {
      title: 'App Home',
      width: 1000,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      x: -1100,
      y: 340,
    },
    createConfig: {
      showSidebar: false,
      saveWindowBounds: true,
      openDevTools: true,
    },
  },
]

export default routes
