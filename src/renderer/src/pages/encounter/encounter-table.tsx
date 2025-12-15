import { Button, Input, Table } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { queryClient } from '@renderer/query-client'
import type { EncounterAttributes } from '@shared/encounter'

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
    render: (_: unknown, record: EncounterAttributes & { patient?: { name?: string } }) => (
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
  return (
    <div className="flex gap-2">
      <Button
        size="small"
        onClick={() => {
          if (typeof record.id === 'number') {
            navigate(`/dashboard/encounter/edit/${record.id}`)
          }
        }}
      >
        Edit
      </Button>
      {typeof record.id === 'number' && (
        <Button size="small" onClick={() => deleteMutation.mutate(record.id!)}>
          Delete
        </Button>
      )}
    </div>
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
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search"
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={() => refetch()}>Refresh</Button>
          <Button type="primary" onClick={() => navigate('/dashboard/encounter/create')}>
            Tambah Encounter
          </Button>
        </div>
      </div>
      {isError || (!data?.success && <div className="text-red-500">{data?.error}</div>)}
      <Table dataSource={filtered} columns={columns} size="small" className="mt-4" rowKey="id" />
    </div>
  )
}

export default EncounterTable

