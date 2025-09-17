import { createHashRouter, RouterProvider } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Sidebar from './components/sidebar/sidebar'
import Home from './pages/home'
import History from './pages/history'
import Environments from './pages/environments'
import Settings from './pages/settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1
    }
  }
})

const router = createHashRouter([
  {
    Component: Sidebar,
    children: [
      { index: true, Component: Home },
      { path: 'history', Component: History },
      { path: 'env', Component: Environments },
      { path: 'settings', Component: Settings }
    ]
  }
])

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full flex flex-col">
        {/* <CustomTitleBar /> */}
        <div className="flex-1 min-h-0">
          <RouterProvider router={router} />
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
