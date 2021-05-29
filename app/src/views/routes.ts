const routes: RouteConfig[] = [
  {
    key: 'Home',
    path: '/',
    redirect: { to: '/main' },
    windowOptions: {
      title: 'App Home',
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      x: -800,
      y: 0,
    },
    createConfig: {
      showSidebar: true,
      saveWindowBounds: false,
    },
  },
]

export default routes
