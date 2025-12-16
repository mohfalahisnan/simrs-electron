import { Button, Dropdown, Input, Table } from 'antd'
import type { MenuProps } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { queryClient } from '@renderer/query-client'
import type { EncounterAttributes } from '@shared/encounter'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'

const columns = [
  { title: 'Tanggal Kunjungan', dataIndex: 'visitDate', key: 'visitDate', render: (v: string) => new Date(v).toLocaleString() },
  { title: 'Pasien', dataIndex: ['patient', 'name'], key: 'patient' },
  { title: 'Layanan', dataIndex: 'serviceType', key: 'serviceType' },
  { title: 'Alasan', dataIndex: 'reason', key: 'reason', ellipsis: true },
  { title: 'Status', dataIndex: 'status', key: 'status' },
  { title: 'Catatan', dataIndex: 'note', key: 'note', ellipsis: true },
  {
    title: 'Action',
    key: 'action',
    width: 60,
    align: 'center' as const,
    render: (_: EncounterAttributes, record: EncounterAttributes & { patient?: { name?: string } }) => (
      <RowActions record={record} />
    )
  }
]

function RowActions({ record }: { record: EncounterAttributes }) {
  const navigate = useNavigate()
  const deleteMutation = useMutation({
    mutationKey: ['encounter', 'delete'],
    mutationFn: (id: number) => {
      const fn = window.api?.query?.encounter?.deleteById
      if (!fn) throw new Error('API encounter tidak tersedia. Silakan restart aplikasi/dev server.')
      return fn({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounter', 'list'] })
    }
  })
  const items: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => {
        if (typeof record.id === 'number') {
          navigate(`/dashboard/encounter/edit/${record.id}`)
        }
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      danger: true,
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: () => {
        if (typeof record.id === 'number') deleteMutation.mutate(record.id)
      }
    }
  ]
  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button aria-label="Actions" className="p-1 rounded hover:bg-gray-100">
        <MoreOutlined />
      </button>
    </Dropdown>
  )
}

export function EncounterTable() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, refetch, isError } = useQuery({
    queryKey: ['encounter', 'list'],
    queryFn: () => {
      const fn = window.api?.query?.encounter?.list
      if (!fn) throw new Error('API encounter tidak tersedia. Silakan restart aplikasi/dev server.')
      return fn()
    }
  })

  const filtered = useMemo(() => {
    const source: (EncounterAttributes & { patient?: { name?: string } })[] =
      (data?.data as any[]) || []
    const q = search.trim().toLowerCase()
    if (!q) return source
    return source.filter((e) => {
      const hay = [e.serviceType, e.reason || '', e.note || '', e.patient?.name || '']
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [data?.data, search])

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Input
          type="text"
          placeholder="Search"
          className="w-full md:max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap md:justify-end">
          <Button onClick={() => refetch()}>Refresh</Button>
          <Button type="primary" onClick={() => navigate('/dashboard/encounter/create')}>
            Tambah Encounter
          </Button>
        </div>
      </div>
      {isError || (!data?.success && <div className="text-red-500">{data?.error}</div>)}
      <Table
        dataSource={filtered}
        columns={columns}
        size="small"
        className="mt-4 rounded-xl shadow-sm"
        rowKey="id"
        scroll={{ x: 'max-content' }}
      />
    </div>
  )
}

export default EncounterTable

