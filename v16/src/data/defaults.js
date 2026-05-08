export const DEFAULT_STATE = {
  tasks: [
    {
      id: 1,
      name: 'Finalize mission checklist',
      owner: 'Captain',
      due: '',
      priority: 'High',
      status: 'Open',
      category: 'Mission Run',
      blocked: false,
      notes: 'Seed task for v16 smoke testing.',
    },
  ],
  members: [
    { id: 1, name: 'Captain', role: 'Lead', group: 'Operations' },
    { id: 2, name: 'Pilot', role: 'Pilot', group: 'Drive Team' },
  ],
  checklist: [
    { id: 1, label: 'Battery charged', done: false },
    { id: 2, label: 'Tether inspected', done: false },
    { id: 3, label: 'Camera feed checked', done: false },
  ],
  prediveChecklist: [
    { id: 1, label: 'Frame and thrusters secure', done: false },
    { id: 2, label: 'Control station ready', done: false },
  ],
  intel: [],
  notes: '',
  quotes: [],
  attachments: [],
  v15AuditLog: [],
  strategy: [],
  practiceRuns: [],
  missionRuns: [],
  missionEvents: [],
  competitionFlowStep: 0,
  missionScoreItems: [
    { id: 'task-1', label: 'Task 1', max: 50, score: 0, status: 'pending' },
    { id: 'task-2', label: 'Task 2', max: 50, score: 0, status: 'pending' },
    { id: 'task-3', label: 'Task 3', max: 50, score: 0, status: 'pending' },
    { id: 'float', label: 'Float / Non-ROV Device', max: 70, score: 0, status: 'pending' },
  ],
  gearItems: [
    { id: 1, name: 'Battery set', category: 'Electrical', qty: 2, packed: false },
    { id: 2, name: 'Tool kit', category: 'Tools', qty: 1, packed: false },
  ],
  presentationRuns: [],
  floatPackets: {
    raw: '',
    analysis: null,
  },
  masterData: {
    roles: ['Lead', 'Coach', 'Pilot', 'Mechanical', 'Electrical', 'Software', 'Presentation', 'Pit Crew'],
    groups: ['Operations', 'Drive Team', 'Engineering', 'Presentation', 'Travel', 'Competition Day'],
    taskTypes: ['Urgent', 'High', 'Medium', 'Low', 'Mission Run', 'Presentation', 'Travel Docs', 'Gear', 'Pre-Dive'],
    gearCats: ['Required', 'Spare', 'Consumable', 'Tools', 'Docs', 'Electrical', 'Mechanical', 'Safety', 'Competition Day'],
  },
};
