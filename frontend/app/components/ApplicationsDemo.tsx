export const demoApplications = [
  {
    id: 101,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    offer: { id: 11, position: 'Desarrollador Frontend', company: { id: 2, name: 'Acme S.A.' } },
  },
  {
    id: 102,
    status: 'BLOCKED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    offer: { id: 12, position: 'Analista de Datos', company: { id: 3, name: 'DataCorp' } },
  },
]

export const demoDrafts = [
  {
    offer: { id: 21, position: 'Práctica en Marketing', company: { id: 4, name: 'Marketly' } },
    attachmentsCount: 1,
  },
  {
    offer: { id: 22, position: 'Soporte Técnico', company: { id: 5, name: 'HelpDesk' } },
    attachmentsCount: 0,
  },
]

export default {} as any
