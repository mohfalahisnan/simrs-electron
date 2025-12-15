import { Button, Input, Table } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { queryClient } from '@renderer/query-client'
import type { PatientAttributes } from '@shared/patient'

const columns = [
  { title: 'Kode', dataIndex: 'kode', key: 'kode' },
  { title: 'Nama', dataIndex: 'name', key: 'name' },
  { title: 'Gender', dataIndex: 'gender', key: 'gender' },
  {
    title: 'Tanggal Lahir',
    dataIndex: 'birthDate',
    key: 'birthDate',
    render: (value: string) => new Date(value).toLocaleDateString()
  },
  { title: 'Phone', dataIndex: 'phone', key: 'phone' },
  { title: 'Email', dataIndex: 'email', key: 'email' },
  { title: 'Alamat', dataIndex: 'addressLine', key: 'addressLine', ellipsis: true },
  {
    title: 'Action',
    key: 'action',
    render: (_: unknown, record: PatientAttributes) => <RowActions record={record} />
  }
]

function RowActions({ record }: { record: PatientAttributes }) {
  const navigate = useNavigate()
  const deleteMutation = useMutation({
    mutationKey: ['patient', 'delete'],
    mutationFn: (id: number) => {
      const fn = window.api?.query?.patient?.deleteById
      if (!fn) throw new Error('API patient tidak tersedia. Silakan restart aplikasi/dev server.')
      return fn({ id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'list'] })
    }
  })
  return (
    <div className="flex gap-2">
      <Button
        size="small"
        onClick={() => {
          if (typeof record.id === 'number') {
            navigate(`/dashboard/patient/edit/${record.id}`)
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

export function PatientTable() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, refetch, isError } = useQuery({
    queryKey: ['patient', 'list'],
    queryFn: () => {
      const fn = window.api?.query?.patient?.list
      if (!fn) throw new Error('API patient tidak tersedia. Silakan restart aplikasi/dev server.')
      return fn()
    }
  })

  const filtered = useMemo(() => {
    const source: PatientAttributes[] = (data?.data as PatientAttributes[]) || []
    const q = search.trim().toLowerCase()
    if (!q) return source
    return source.filter((p) => {
      const hay = [p.kode, p.name, p.phone, p.email].filter(Boolean).join(' ').toLowerCase()
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
          <Button type="primary" onClick={() => navigate('/dashboard/patient/register')}>
            Tambah Pasien
          </Button>
        </div>
      </div>
      {isError || (!data?.success && <div className="text-red-500">{data?.error}</div>)}
      <Table dataSource={filtered} columns={columns} size="small" className="mt-4" rowKey="id" />
    </div>
  )
}

export default PatientTable
