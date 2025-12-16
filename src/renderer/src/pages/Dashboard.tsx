import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import ProfileMenu from '@renderer/components/ProfileMenu'
import logoUrl from '@renderer/assets/logo.png'
import { CalendarOutlined, DashboardOutlined, DollarOutlined, LeftCircleFilled, RightCircleFilled, UserOutlined, WalletOutlined } from '@ant-design/icons'

const items = [
  {
    label: 'Dashboard',
    key: '/dashboard',
    icon: <DashboardOutlined />
  },
  {
    label: 'Expense',
    icon: <WalletOutlined />,
    children: [
      {
        label: 'Expense',
        key: '/dashboard/expense',
        icon: <WalletOutlined />
      },
      {
        label: 'Income',
        key: '/dashboard/income',
        icon: <DollarOutlined />
      }
    ]
  },

  {
    label: 'Patient',
    key: '/dashboard/patient',
    icon: <UserOutlined />
  },
  {
    label: 'Encounter',
    key: '/dashboard/encounter',
    icon: <CalendarOutlined />
  }
]

function Dashboard() {
  const location = useLocation()
  const [current, setCurrent] = useState(
    items.find((item) => item.key === location.pathname)?.key || items[0].key
  )
  const [collapsed, setCollapsed] = useState(false)

  const navigate = useNavigate()
  const onClick: MenuProps['onClick'] = (e) => {
    const key = String(e.key)
    navigate(key)
    setCurrent(key)
  }
  return (
    <div className="min-h-screen flex">
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white shadow-sm flex flex-col`}>
        <div className="h-14 px-4 flex items-center shadow-sm justify-center">
          <div className="flex items-center justify-center gap-2">
            <img src={logoUrl} alt="Logo" className="w-8 h-8" />
            <span className={`${collapsed ? 'hidden' : 'font-semibold text-lg'}`}>SIMRS</span>
          </div>
        </div>
        <Menu
          onClick={onClick}
          selectedKeys={[current as string]}
          mode="inline"
          inlineCollapsed={collapsed}
          items={items as ItemType[]}
          className=""
        />
        <div className="mt-auto px-4 py-3 flex justify-center">
          <button
            aria-label="Toggle sidebar"
            className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 shadow"
            onClick={() => setCollapsed((p) => !p)}
          >
            {collapsed ? <RightCircleFilled /> : <LeftCircleFilled />}
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-50 bg-white shadow-sm h-14 px-4 flex items-center justify-end">
          <ProfileMenu />
        </header>
        <div className="p-4 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
