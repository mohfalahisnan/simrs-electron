import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

function DashboardHome() {
  const [session, setSession] = useState<any>()
  const navigate = useNavigate()
  useEffect(() => {
    window.api.auth.getSession().then((res) => {
      console.log('getSession', res)
      if (res.success) {
        setSession(res)
      }
    })
  }, [])
  return (
    <div>
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={async () => {
            console.log('List Protected Users', window.api)
            const users = await window.api.user.list()
            console.log(users)
          }}
        >
          List Protected Users
        </Button>
      </div>
      {session ? <div>Welcome, {session?.user?.username}</div> : <div>Not Authenticated</div>}
      <Button
        onClick={async () => {
          await window.api.auth.logout()
          setSession(undefined)
          navigate('/')
        }}
      >
        Logout
      </Button>
    </div>
  )
}

export default DashboardHome
