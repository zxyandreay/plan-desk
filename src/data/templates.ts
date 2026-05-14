import type {
  ColorToken,
  FolderTemplate,
  ProjectTemplate,
  Task,
  TaskStatus,
  WorkflowColumn,
  WorkflowColumnType,
  WorkflowTemplate,
} from '../types/models'

export const DEFAULT_WORKFLOW_TEMPLATE_ID = 'standard'
export const DEFAULT_FOLDER_TEMPLATE_ID = 'basic-project'
export const BLANK_PROJECT_TEMPLATE_ID = 'blank'

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'A balanced workflow for most projects.',
    columns: [
      { id: 'backlog', name: 'Backlog', color: 'slate', order: 0, type: 'todo' },
      { id: 'todo', name: 'To Do', color: 'blue', order: 1, type: 'todo' },
      { id: 'in_progress', name: 'In Progress', color: 'sky', order: 2, type: 'active' },
      { id: 'review', name: 'Review', color: 'purple', order: 3, type: 'review' },
      { id: 'blocked', name: 'Blocked', color: 'red', order: 4, type: 'blocked' },
      { id: 'done', name: 'Done', color: 'green', order: 5, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'simple',
    name: 'Simple',
    description: 'A compact workflow for lightweight projects.',
    columns: [
      { id: 'todo', name: 'To Do', color: 'blue', order: 0, type: 'todo' },
      { id: 'doing', name: 'Doing', color: 'sky', order: 1, type: 'active' },
      { id: 'done', name: 'Done', color: 'green', order: 2, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'student',
    name: 'Student',
    description: 'For assignments, school projects, and capstones.',
    columns: [
      { id: 'not_started', name: 'Not Started', color: 'slate', order: 0, type: 'todo' },
      { id: 'researching', name: 'Researching', color: 'teal', order: 1, type: 'active' },
      { id: 'in_progress', name: 'In Progress', color: 'sky', order: 2, type: 'active' },
      { id: 'for_review', name: 'For Review', color: 'purple', order: 3, type: 'review' },
      { id: 'submitted', name: 'Submitted', color: 'green', order: 4, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    description: 'For creative work moving from brief to approval.',
    columns: [
      { id: 'brief', name: 'Brief', color: 'slate', order: 0, type: 'todo' },
      { id: 'concept', name: 'Concept', color: 'purple', order: 1, type: 'active' },
      { id: 'design', name: 'Design', color: 'violet', order: 2, type: 'active' },
      { id: 'revision', name: 'Revision', color: 'orange', order: 3, type: 'review' },
      { id: 'approved', name: 'Approved', color: 'green', order: 4, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'content',
    name: 'Content',
    description: 'For ideas, drafts, edits, scheduling, and publishing.',
    columns: [
      { id: 'idea', name: 'Idea', color: 'amber', order: 0, type: 'todo' },
      { id: 'drafting', name: 'Drafting', color: 'sky', order: 1, type: 'active' },
      { id: 'editing', name: 'Editing', color: 'purple', order: 2, type: 'review' },
      { id: 'scheduled', name: 'Scheduled', color: 'teal', order: 3, type: 'active' },
      { id: 'published', name: 'Published', color: 'green', order: 4, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'client-work',
    name: 'Client Work',
    description: 'For leads, active work, revisions, delivery, and payment.',
    columns: [
      { id: 'lead', name: 'Lead', color: 'slate', order: 0, type: 'todo' },
      { id: 'quoted', name: 'Quoted', color: 'blue', order: 1, type: 'todo' },
      { id: 'active', name: 'Active', color: 'sky', order: 2, type: 'active' },
      { id: 'waiting', name: 'Waiting', color: 'amber', order: 3, type: 'blocked' },
      { id: 'revision', name: 'Revision', color: 'orange', order: 4, type: 'review' },
      { id: 'delivered', name: 'Delivered', color: 'teal', order: 5, type: 'done', isCompleted: true },
      { id: 'paid', name: 'Paid', color: 'green', order: 6, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'For event logistics from planning to final confirmation.',
    columns: [
      { id: 'planned', name: 'Planned', color: 'blue', order: 0, type: 'todo' },
      { id: 'contacted', name: 'Contacted', color: 'sky', order: 1, type: 'active' },
      { id: 'confirmed', name: 'Confirmed', color: 'teal', order: 2, type: 'active' },
      { id: 'paid', name: 'Paid', color: 'amber', order: 3, type: 'active' },
      { id: 'done', name: 'Done', color: 'green', order: 4, type: 'done', isCompleted: true },
    ],
  },
  {
    id: 'software-development',
    name: 'Software Development',
    description: 'For product and app development from backlog to release.',
    columns: [
      { id: 'backlog', name: 'Backlog', color: 'slate', order: 0, type: 'todo' },
      { id: 'todo', name: 'To Do', color: 'blue', order: 1, type: 'todo' },
      { id: 'in_progress', name: 'In Progress', color: 'sky', order: 2, type: 'active' },
      { id: 'review', name: 'Review', color: 'purple', order: 3, type: 'review' },
      { id: 'testing', name: 'Testing', color: 'amber', order: 4, type: 'review' },
      { id: 'blocked', name: 'Blocked', color: 'red', order: 5, type: 'blocked' },
      { id: 'done', name: 'Done', color: 'green', order: 6, type: 'done', isCompleted: true },
    ],
  },
]

export const folderTemplates: FolderTemplate[] = [
  {
    id: 'basic-project',
    name: 'Basic Project',
    description: 'A simple folder structure for general project work.',
    folders: [
      { id: 'documents', name: 'Documents', path: 'Documents', linkedEntityHint: 'project', color: 'blue' },
      { id: 'resources', name: 'Resources', path: 'Resources', linkedEntityHint: 'project', color: 'teal' },
      { id: 'outputs', name: 'Outputs', path: 'Outputs', linkedEntityHint: 'project', color: 'green' },
      { id: 'archive', name: 'Archive', path: 'Archive', linkedEntityHint: 'project', color: 'slate' },
    ],
  },
  {
    id: 'client-website',
    name: 'Client Website',
    description: 'Discovery, content, design, development, launch, and delivery folders.',
    folders: [
      { id: 'discovery', name: '01 Discovery', path: '01 Discovery', milestoneTemplateId: 'discovery', linkedEntityHint: 'milestone', color: 'blue' },
      { id: 'content', name: '02 Content', path: '02 Content', milestoneTemplateId: 'content-collection', linkedEntityHint: 'milestone', color: 'teal' },
      { id: 'design', name: '03 Design', path: '03 Design', milestoneTemplateId: 'design', linkedEntityHint: 'milestone', color: 'purple' },
      { id: 'development', name: '04 Development', path: '04 Development', milestoneTemplateId: 'development', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'review', name: '05 Review', path: '05 Review', milestoneTemplateId: 'client-review', linkedEntityHint: 'milestone', color: 'orange' },
      { id: 'launch', name: '06 Launch', path: '06 Launch', milestoneTemplateId: 'launch', linkedEntityHint: 'milestone', color: 'green' },
      { id: 'final-delivery', name: 'Final Delivery', path: 'Final Delivery', linkedEntityHint: 'project', color: 'green' },
      { id: 'resources', name: 'Resources', path: 'Resources', linkedEntityHint: 'project', color: 'teal' },
    ],
  },
  {
    id: 'software-development',
    name: 'Software/App Development',
    description: 'Planning, source, testing, builds, releases, docs, and assets.',
    folders: [
      { id: 'planning', name: '01 Planning', path: '01 Planning', milestoneTemplateId: 'planning', linkedEntityHint: 'milestone', color: 'blue' },
      { id: 'design', name: '02 Design', path: '02 Design', milestoneTemplateId: 'design', linkedEntityHint: 'milestone', color: 'purple' },
      { id: 'source', name: '03 Source', path: '03 Source', milestoneTemplateId: 'development', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'testing', name: '04 Testing', path: '04 Testing', milestoneTemplateId: 'testing', linkedEntityHint: 'milestone', color: 'amber' },
      { id: 'builds', name: '05 Builds', path: '05 Builds', linkedEntityHint: 'project', color: 'teal' },
      { id: 'releases', name: '06 Releases', path: '06 Releases', milestoneTemplateId: 'release', linkedEntityHint: 'milestone', color: 'green' },
      { id: 'documentation', name: 'Documentation', path: 'Documentation', linkedEntityHint: 'project', color: 'slate' },
      { id: 'assets', name: 'Assets', path: 'Assets', linkedEntityHint: 'project', color: 'purple' },
    ],
  },
  {
    id: 'student-project',
    name: 'Student Project',
    description: 'Requirements, research, drafts, references, and submission folders.',
    folders: [
      { id: 'requirements', name: '01 Requirements', path: '01 Requirements', milestoneTemplateId: 'requirements', linkedEntityHint: 'milestone', color: 'blue' },
      { id: 'research', name: '02 Research', path: '02 Research', milestoneTemplateId: 'research', linkedEntityHint: 'milestone', color: 'teal' },
      { id: 'drafts', name: '03 Drafts', path: '03 Drafts', milestoneTemplateId: 'drafting', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'final-output', name: '04 Final Output', path: '04 Final Output', milestoneTemplateId: 'submission', linkedEntityHint: 'milestone', color: 'green' },
      { id: 'references', name: 'References', path: 'References', linkedEntityHint: 'project', color: 'teal' },
      { id: 'submission', name: 'Submission', path: 'Submission', milestoneTemplateId: 'submission', linkedEntityHint: 'milestone', color: 'green' },
    ],
  },
  {
    id: 'research-paper',
    name: 'Research Paper',
    description: 'Topic, sources, notes, drafts, revisions, and bibliography folders.',
    folders: [
      { id: 'topic', name: '01 Topic', path: '01 Topic', milestoneTemplateId: 'topic-approval', linkedEntityHint: 'milestone', color: 'blue' },
      { id: 'sources', name: '02 Sources', path: '02 Sources', milestoneTemplateId: 'source-gathering', linkedEntityHint: 'milestone', color: 'teal' },
      { id: 'notes', name: '03 Notes', path: '03 Notes', linkedEntityHint: 'project', color: 'slate' },
      { id: 'drafts', name: '04 Drafts', path: '04 Drafts', milestoneTemplateId: 'drafting', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'revisions', name: '05 Revisions', path: '05 Revisions', milestoneTemplateId: 'revision', linkedEntityHint: 'milestone', color: 'purple' },
      { id: 'final-submission', name: 'Final Submission', path: 'Final Submission', milestoneTemplateId: 'final-submission', linkedEntityHint: 'milestone', color: 'green' },
      { id: 'bibliography', name: 'Bibliography', path: 'Bibliography', linkedEntityHint: 'project', color: 'teal' },
    ],
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Budget, venue, suppliers, guest list, schedule, and receipts.',
    folders: [
      { id: 'budget', name: '01 Budget', path: '01 Budget', milestoneTemplateId: 'budget', linkedEntityHint: 'milestone', color: 'amber' },
      { id: 'venue', name: '02 Venue', path: '02 Venue', milestoneTemplateId: 'venue', linkedEntityHint: 'milestone', color: 'blue' },
      { id: 'suppliers', name: '03 Suppliers', path: '03 Suppliers', milestoneTemplateId: 'suppliers', linkedEntityHint: 'milestone', color: 'teal' },
      { id: 'guest-list', name: '04 Guest List', path: '04 Guest List', milestoneTemplateId: 'invitations', linkedEntityHint: 'milestone', color: 'purple' },
      { id: 'schedule', name: '05 Schedule', path: '05 Schedule', milestoneTemplateId: 'final-preparation', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'final-files', name: '06 Final Files', path: '06 Final Files', linkedEntityHint: 'project', color: 'green' },
      { id: 'receipts', name: 'Receipts', path: 'Receipts', linkedEntityHint: 'project', color: 'orange' },
    ],
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Ideas, scripts, assets, drafts, scheduled posts, publishing, and analytics.',
    folders: [
      { id: 'ideas', name: '01 Ideas', path: '01 Ideas', milestoneTemplateId: 'ideas', linkedEntityHint: 'milestone', color: 'amber' },
      { id: 'scripts', name: '02 Scripts', path: '02 Scripts', linkedEntityHint: 'project', color: 'blue' },
      { id: 'assets', name: '03 Assets', path: '03 Assets', milestoneTemplateId: 'design-editing', linkedEntityHint: 'milestone', color: 'purple' },
      { id: 'drafts', name: '04 Drafts', path: '04 Drafts', milestoneTemplateId: 'drafting', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'scheduled', name: '05 Scheduled', path: '05 Scheduled', milestoneTemplateId: 'scheduling', linkedEntityHint: 'milestone', color: 'teal' },
      { id: 'published', name: '06 Published', path: '06 Published', milestoneTemplateId: 'publishing', linkedEntityHint: 'milestone', color: 'green' },
      { id: 'analytics', name: 'Analytics', path: 'Analytics', linkedEntityHint: 'project', color: 'slate' },
    ],
  },
  {
    id: 'freelance-client-work',
    name: 'Freelance Client Work',
    description: 'Brief, proposal, contract, work files, review, delivery, and invoices.',
    folders: [
      { id: 'brief', name: '01 Brief', path: '01 Brief', milestoneTemplateId: 'inquiry', linkedEntityHint: 'milestone', color: 'blue' },
      { id: 'proposal', name: '02 Proposal', path: '02 Proposal', milestoneTemplateId: 'proposal', linkedEntityHint: 'milestone', color: 'teal' },
      { id: 'contract', name: '03 Contract', path: '03 Contract', milestoneTemplateId: 'contract', linkedEntityHint: 'milestone', color: 'slate' },
      { id: 'work-files', name: '04 Work Files', path: '04 Work Files', milestoneTemplateId: 'work-in-progress', linkedEntityHint: 'milestone', color: 'sky' },
      { id: 'client-review', name: '05 Client Review', path: '05 Client Review', milestoneTemplateId: 'review', linkedEntityHint: 'milestone', color: 'orange' },
      { id: 'final-delivery', name: '06 Final Delivery', path: '06 Final Delivery', milestoneTemplateId: 'delivery', linkedEntityHint: 'milestone', color: 'green' },
      { id: 'invoices', name: 'Invoices', path: 'Invoices', milestoneTemplateId: 'payment', linkedEntityHint: 'milestone', color: 'amber' },
    ],
  },
]

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start clean with no predefined milestones or tasks.',
    category: 'General',
    defaultGoal: '',
    workflowTemplateId: 'standard',
    folderTemplateId: 'basic-project',
    milestones: [],
    tasks: [],
    issues: [],
    notes: [],
    color: 'slate',
  },
  {
    id: 'student-project',
    name: 'Student Project',
    description: 'Assignments, group projects, capstones, and school requirements.',
    category: 'Study',
    defaultGoal: 'Complete the requirement on time with organized research, drafts, and final submission materials.',
    workflowTemplateId: 'student',
    folderTemplateId: 'student-project',
    color: 'teal',
    milestones: [
      { id: 'requirements', title: 'Topic / Requirements', description: 'Clarify the expected output, rubric, and constraints.', order: 0, color: 'blue' },
      { id: 'research', title: 'Research', description: 'Gather references and supporting material.', order: 1, color: 'teal' },
      { id: 'drafting', title: 'Drafting', description: 'Create outlines, drafts, and working materials.', order: 2, color: 'sky' },
      { id: 'review', title: 'Review', description: 'Review and polish the final output.', order: 3, color: 'purple' },
      { id: 'submission', title: 'Submission', description: 'Prepare and submit the requirement.', order: 4, color: 'green' },
    ],
    tasks: [
      { id: 'clarify-requirements', title: 'Clarify project requirements', milestoneTemplateId: 'requirements', columnId: 'not_started', priority: 'high', tags: ['requirements'], color: 'blue' },
      { id: 'gather-references', title: 'Gather references', milestoneTemplateId: 'research', columnId: 'researching', priority: 'medium', tags: ['research'], color: 'teal' },
      { id: 'create-outline', title: 'Create outline', milestoneTemplateId: 'drafting', columnId: 'in_progress', priority: 'medium', tags: ['draft'], color: 'sky' },
      { id: 'first-draft', title: 'Prepare first draft', milestoneTemplateId: 'drafting', columnId: 'in_progress', priority: 'high', tags: ['draft'], color: 'sky' },
      { id: 'review-final', title: 'Review final output', milestoneTemplateId: 'review', columnId: 'for_review', priority: 'high', tags: ['review'], color: 'purple' },
      { id: 'submit-requirement', title: 'Submit requirement', milestoneTemplateId: 'submission', columnId: 'submitted', priority: 'urgent', tags: ['submission'], color: 'green' },
    ],
    notes: [
      { id: 'rubric-notes', title: 'Rubric notes', content: 'Paste important rubric items, grading notes, or professor feedback here.', color: 'blue' },
    ],
  },
  {
    id: 'research-paper',
    name: 'Research Paper',
    description: 'A structured academic writing project.',
    category: 'Research',
    defaultGoal: 'Produce a well-supported paper with organized sources, citations, drafts, and revisions.',
    workflowTemplateId: 'student',
    folderTemplateId: 'research-paper',
    color: 'teal',
    milestones: [
      { id: 'topic-approval', title: 'Topic Approval', order: 0, color: 'blue' },
      { id: 'source-gathering', title: 'Source Gathering', order: 1, color: 'teal' },
      { id: 'outline', title: 'Outline', order: 2, color: 'sky' },
      { id: 'drafting', title: 'Drafting', order: 3, color: 'purple' },
      { id: 'revision', title: 'Revision', order: 4, color: 'orange' },
      { id: 'final-submission', title: 'Final Submission', order: 5, color: 'green' },
    ],
    tasks: [
      { id: 'research-question', title: 'Define research question', milestoneTemplateId: 'topic-approval', columnId: 'not_started', priority: 'high', tags: ['topic'], color: 'blue' },
      { id: 'academic-sources', title: 'Collect academic sources', milestoneTemplateId: 'source-gathering', columnId: 'researching', priority: 'high', tags: ['sources'], color: 'teal' },
      { id: 'bibliography', title: 'Create bibliography', milestoneTemplateId: 'source-gathering', columnId: 'researching', priority: 'medium', tags: ['citations'], color: 'teal' },
      { id: 'write-intro', title: 'Write introduction', milestoneTemplateId: 'drafting', columnId: 'in_progress', priority: 'medium', tags: ['writing'], color: 'purple' },
      { id: 'review-citations', title: 'Review citations', milestoneTemplateId: 'revision', columnId: 'for_review', priority: 'high', tags: ['citations'], color: 'orange' },
      { id: 'proofread', title: 'Final proofreading', milestoneTemplateId: 'final-submission', columnId: 'for_review', priority: 'high', tags: ['final'], color: 'green' },
    ],
    notes: [
      { id: 'working-thesis', title: 'Working thesis', content: 'Track the current thesis, key arguments, and open questions.', color: 'teal' },
    ],
  },
  {
    id: 'client-website',
    name: 'Client Website',
    description: 'A practical workflow for redesigns, marketing sites, and launches.',
    category: 'Freelance',
    defaultGoal: 'Launch an approved website with organized content, assets, QA notes, and final delivery files.',
    workflowTemplateId: 'client-work',
    folderTemplateId: 'client-website',
    color: 'blue',
    milestones: [
      { id: 'discovery', title: 'Discovery', order: 0, color: 'blue' },
      { id: 'content-collection', title: 'Content Collection', order: 1, color: 'teal' },
      { id: 'design', title: 'Design', order: 2, color: 'purple' },
      { id: 'development', title: 'Development', order: 3, color: 'sky' },
      { id: 'client-review', title: 'Client Review', order: 4, color: 'orange' },
      { id: 'launch', title: 'Launch', order: 5, color: 'green' },
    ],
    tasks: [
      { id: 'collect-assets', title: 'Collect brand assets', milestoneTemplateId: 'content-collection', columnId: 'waiting', priority: 'high', tags: ['assets'], color: 'teal' },
      { id: 'confirm-sitemap', title: 'Confirm sitemap', milestoneTemplateId: 'discovery', columnId: 'active', priority: 'high', tags: ['scope'], color: 'blue' },
      { id: 'homepage-design', title: 'Create homepage design', milestoneTemplateId: 'design', columnId: 'active', priority: 'high', tags: ['design'], color: 'purple' },
      { id: 'build-landing', title: 'Build landing page', milestoneTemplateId: 'development', columnId: 'active', priority: 'high', tags: ['build'], color: 'sky' },
      { id: 'responsive-test', title: 'Test responsive layout', milestoneTemplateId: 'development', columnId: 'revision', priority: 'medium', tags: ['qa'], color: 'orange' },
      { id: 'launch-checklist', title: 'Prepare launch checklist', milestoneTemplateId: 'launch', columnId: 'delivered', priority: 'urgent', tags: ['launch'], color: 'green' },
    ],
    issues: [
      { id: 'waiting-content', title: 'Waiting for client content', description: 'Client content delays can affect design and development timing.', severity: 'medium', color: 'amber' },
      { id: 'missing-logo', title: 'Missing logo or brand assets', description: 'Final visual polish depends on production-ready brand assets.', severity: 'high', color: 'orange' },
    ],
    notes: [
      { id: 'client-decisions', title: 'Client decisions', content: 'Track confirmed scope, preferred style, and launch decisions.', color: 'blue' },
    ],
  },
  {
    id: 'software-development',
    name: 'Software/App Development',
    description: 'Plan, build, test, and package a software release.',
    category: 'Software',
    defaultGoal: 'Ship a stable release with clear scope, tested core flows, and packaged artifacts.',
    workflowTemplateId: 'software-development',
    folderTemplateId: 'software-development',
    color: 'sky',
    milestones: [
      { id: 'planning', title: 'Planning', order: 0, color: 'blue' },
      { id: 'design', title: 'Design', order: 1, color: 'purple' },
      { id: 'development', title: 'Development', order: 2, color: 'sky' },
      { id: 'testing', title: 'Testing', order: 3, color: 'amber' },
      { id: 'release', title: 'Release', order: 4, color: 'green' },
    ],
    tasks: [
      { id: 'mvp-scope', title: 'Define MVP scope', milestoneTemplateId: 'planning', columnId: 'todo', priority: 'high', tags: ['scope'], color: 'blue' },
      { id: 'data-model', title: 'Create data model', milestoneTemplateId: 'planning', columnId: 'in_progress', priority: 'high', tags: ['architecture'], color: 'teal' },
      { id: 'core-ui', title: 'Build core UI', milestoneTemplateId: 'development', columnId: 'in_progress', priority: 'high', tags: ['ui'], color: 'sky' },
      { id: 'main-flows', title: 'Test main flows', milestoneTemplateId: 'testing', columnId: 'testing', priority: 'high', tags: ['qa'], color: 'amber' },
      { id: 'release-blockers', title: 'Fix release blockers', milestoneTemplateId: 'testing', columnId: 'blocked', priority: 'urgent', tags: ['release'], color: 'red' },
      { id: 'package-release', title: 'Package release', milestoneTemplateId: 'release', columnId: 'done', priority: 'high', tags: ['build'], color: 'green' },
    ],
  },
  {
    id: 'event-planning',
    name: 'Event Planning',
    description: 'Coordinate venue, suppliers, guests, timing, and final files.',
    category: 'Event',
    defaultGoal: 'Keep event logistics visible from budget through final preparation.',
    workflowTemplateId: 'event-planning',
    folderTemplateId: 'event-planning',
    color: 'amber',
    milestones: [
      { id: 'budget', title: 'Budget', order: 0, color: 'amber' },
      { id: 'venue', title: 'Venue', order: 1, color: 'blue' },
      { id: 'suppliers', title: 'Suppliers', order: 2, color: 'teal' },
      { id: 'invitations', title: 'Invitations', order: 3, color: 'purple' },
      { id: 'final-preparation', title: 'Final Preparation', order: 4, color: 'sky' },
      { id: 'event-day', title: 'Event Day', order: 5, color: 'green' },
    ],
    tasks: [
      { id: 'event-budget', title: 'Set event budget', milestoneTemplateId: 'budget', columnId: 'planned', priority: 'high', tags: ['budget'], color: 'amber' },
      { id: 'venue-options', title: 'Shortlist venue options', milestoneTemplateId: 'venue', columnId: 'contacted', priority: 'high', tags: ['venue'], color: 'blue' },
      { id: 'contact-suppliers', title: 'Contact suppliers', milestoneTemplateId: 'suppliers', columnId: 'contacted', priority: 'medium', tags: ['suppliers'], color: 'teal' },
      { id: 'guest-list', title: 'Prepare guest list', milestoneTemplateId: 'invitations', columnId: 'confirmed', priority: 'medium', tags: ['guests'], color: 'purple' },
      { id: 'final-schedule', title: 'Confirm final schedule', milestoneTemplateId: 'final-preparation', columnId: 'planned', priority: 'high', tags: ['schedule'], color: 'sky' },
    ],
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    description: 'Plan content ideas, scripts, visuals, scheduling, and publishing.',
    category: 'Content',
    defaultGoal: 'Create and publish content with organized assets, deadlines, and review steps.',
    workflowTemplateId: 'content',
    folderTemplateId: 'content-calendar',
    color: 'rose',
    milestones: [
      { id: 'ideas', title: 'Ideas', order: 0, color: 'amber' },
      { id: 'drafting', title: 'Drafting', order: 1, color: 'sky' },
      { id: 'design-editing', title: 'Design/Editing', order: 2, color: 'purple' },
      { id: 'scheduling', title: 'Scheduling', order: 3, color: 'teal' },
      { id: 'publishing', title: 'Publishing', order: 4, color: 'green' },
    ],
    tasks: [
      { id: 'content-ideas', title: 'List content ideas', milestoneTemplateId: 'ideas', columnId: 'idea', priority: 'medium', tags: ['ideas'], color: 'amber' },
      { id: 'captions-scripts', title: 'Draft captions/scripts', milestoneTemplateId: 'drafting', columnId: 'drafting', priority: 'medium', tags: ['copy'], color: 'sky' },
      { id: 'visuals', title: 'Prepare visuals', milestoneTemplateId: 'design-editing', columnId: 'editing', priority: 'high', tags: ['assets'], color: 'purple' },
      { id: 'schedule-post', title: 'Schedule post', milestoneTemplateId: 'scheduling', columnId: 'scheduled', priority: 'high', tags: ['schedule'], color: 'teal' },
      { id: 'review-performance', title: 'Review performance', milestoneTemplateId: 'publishing', columnId: 'published', priority: 'low', tags: ['analytics'], color: 'green' },
    ],
  },
  {
    id: 'freelance-client-work',
    name: 'Freelance Client Work',
    description: 'Manage inquiry, proposal, contract, delivery, review, and payment.',
    category: 'Freelance',
    defaultGoal: 'Deliver client work cleanly while keeping scope, review, delivery, and payment visible.',
    workflowTemplateId: 'client-work',
    folderTemplateId: 'freelance-client-work',
    color: 'violet',
    milestones: [
      { id: 'inquiry', title: 'Inquiry', order: 0, color: 'blue' },
      { id: 'proposal', title: 'Proposal', order: 1, color: 'teal' },
      { id: 'contract', title: 'Contract', order: 2, color: 'slate' },
      { id: 'work-in-progress', title: 'Work in Progress', order: 3, color: 'sky' },
      { id: 'review', title: 'Review', order: 4, color: 'orange' },
      { id: 'delivery', title: 'Delivery', order: 5, color: 'green' },
      { id: 'payment', title: 'Payment', order: 6, color: 'amber' },
    ],
    tasks: [
      { id: 'client-requirements', title: 'Record client requirements', milestoneTemplateId: 'inquiry', columnId: 'lead', priority: 'high', tags: ['brief'], color: 'blue' },
      { id: 'proposal', title: 'Prepare proposal', milestoneTemplateId: 'proposal', columnId: 'quoted', priority: 'high', tags: ['proposal'], color: 'teal' },
      { id: 'scope', title: 'Confirm scope', milestoneTemplateId: 'contract', columnId: 'active', priority: 'high', tags: ['scope'], color: 'slate' },
      { id: 'deliverables', title: 'Complete deliverables', milestoneTemplateId: 'work-in-progress', columnId: 'active', priority: 'high', tags: ['work'], color: 'sky' },
      { id: 'final-files', title: 'Send final files', milestoneTemplateId: 'delivery', columnId: 'delivered', priority: 'high', tags: ['delivery'], color: 'green' },
      { id: 'payment-follow-up', title: 'Follow up payment', milestoneTemplateId: 'payment', columnId: 'paid', priority: 'medium', tags: ['invoice'], color: 'amber' },
    ],
  },
  {
    id: 'home-personal-project',
    name: 'Home / Personal Project',
    description: 'Personal goals, household projects, hobbies, and practical plans.',
    category: 'Personal',
    defaultGoal: 'Finish the project with clear steps, needed materials, and visible progress.',
    workflowTemplateId: 'simple',
    folderTemplateId: 'basic-project',
    color: 'green',
    milestones: [
      { id: 'planning', title: 'Planning', order: 0, color: 'blue' },
      { id: 'materials', title: 'Materials', order: 1, color: 'amber' },
      { id: 'work-phase', title: 'Work Phase', order: 2, color: 'sky' },
      { id: 'review', title: 'Review', order: 3, color: 'purple' },
      { id: 'completion', title: 'Completion', order: 4, color: 'green' },
    ],
    tasks: [
      { id: 'goal', title: 'Define project goal', milestoneTemplateId: 'planning', columnId: 'todo', priority: 'medium', tags: ['plan'], color: 'blue' },
      { id: 'materials', title: 'List needed materials', milestoneTemplateId: 'materials', columnId: 'todo', priority: 'medium', tags: ['materials'], color: 'amber' },
      { id: 'budget', title: 'Set budget', milestoneTemplateId: 'materials', columnId: 'todo', priority: 'medium', tags: ['budget'], color: 'orange' },
      { id: 'main-task', title: 'Complete main task', milestoneTemplateId: 'work-phase', columnId: 'doing', priority: 'high', tags: ['work'], color: 'sky' },
      { id: 'final-review', title: 'Review final result', milestoneTemplateId: 'review', columnId: 'done', priority: 'low', tags: ['review'], color: 'green' },
    ],
  },
]

export function getWorkflowTemplate(templateId?: string) {
  return workflowTemplates.find((template) => template.id === templateId) ?? workflowTemplates[0]
}

export function getProjectTemplate(templateId?: string) {
  return projectTemplates.find((template) => template.id === templateId) ?? projectTemplates[0]
}

export function getFolderTemplate(templateId?: string) {
  return folderTemplates.find((template) => template.id === templateId) ?? folderTemplates[0]
}

export function workflowColumnId(projectId: string, templateColumnId: string) {
  return `workflow_${projectId}_${templateColumnId}`
}

export function createWorkflowColumns(
  projectId: string,
  workflowTemplateId = DEFAULT_WORKFLOW_TEMPLATE_ID,
  timestamp: string,
) {
  const template = getWorkflowTemplate(workflowTemplateId)
  return template.columns.map<WorkflowColumn>((column) => ({
    id: workflowColumnId(projectId, column.id),
    projectId,
    name: column.name,
    color: column.color,
    order: column.order,
    type: column.type,
    isCompleted: Boolean(column.isCompleted),
    isDefault: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}

export function getProjectWorkflowColumns(workflowColumns: WorkflowColumn[], projectId: string) {
  return workflowColumns
    .filter((column) => column.projectId === projectId)
    .sort((a, b) => a.order - b.order)
}

export function legacyStatusToColumnId(status: TaskStatus, columns: WorkflowColumn[]) {
  const byName = (name: string) => columns.find((column) => column.name.toLowerCase() === name)
  const byType = (type: WorkflowColumnType) => columns.find((column) => column.type === type)
  const byPartial = (value: string) => columns.find((column) => column.id.includes(value) || column.name.toLowerCase().includes(value))

  if (status === 'done') return byType('done')?.id ?? byName('done')?.id ?? columns[columns.length - 1]?.id
  if (status === 'blocked') return byType('blocked')?.id ?? byPartial('blocked')?.id ?? byType('active')?.id ?? columns[0]?.id
  if (status === 'review') return byType('review')?.id ?? byPartial('review')?.id ?? byType('active')?.id ?? columns[0]?.id
  if (status === 'in_progress') return byType('active')?.id ?? byPartial('progress')?.id ?? columns[0]?.id
  if (status === 'backlog') return byPartial('backlog')?.id ?? byType('todo')?.id ?? columns[0]?.id
  return byName('to do')?.id ?? byType('todo')?.id ?? columns[0]?.id
}

export function statusFromWorkflowColumn(column?: WorkflowColumn): TaskStatus {
  if (!column) return 'todo'
  if (column.isCompleted || column.type === 'done') return 'done'
  if (column.type === 'blocked') return 'blocked'
  if (column.type === 'review') return 'review'
  if (column.type === 'active') return 'in_progress'
  if (column.id.toLowerCase().includes('backlog') || column.name.toLowerCase().includes('backlog')) return 'backlog'
  return 'todo'
}

export function getTaskWorkflowColumn(task: Task, columns: WorkflowColumn[]) {
  return columns.find((column) => column.id === task.columnId) ?? columns.find((column) => column.id === legacyStatusToColumnId(task.status, columns))
}

export function isTaskCompletedByWorkflow(task: Task, columns: WorkflowColumn[]) {
  const column = getTaskWorkflowColumn(task, columns)
  return Boolean(column?.isCompleted || column?.type === 'done' || task.status === 'done')
}

export function isTaskBlockedByWorkflow(task: Task, columns: WorkflowColumn[]) {
  const column = getTaskWorkflowColumn(task, columns)
  return Boolean(column?.type === 'blocked' || task.status === 'blocked')
}

export function colorForColumnType(type: WorkflowColumnType): ColorToken {
  if (type === 'done') return 'green'
  if (type === 'blocked') return 'red'
  if (type === 'review') return 'purple'
  if (type === 'active') return 'sky'
  if (type === 'todo') return 'blue'
  return 'slate'
}
