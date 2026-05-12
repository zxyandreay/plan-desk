import { Edit3, Link2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { Note, NoteFormValues, ResourceFormValues } from '../../types/models'
import { colorClass } from '../../utils/colors'
import { formatDate } from '../../utils/date'
import { resourceCountForEntity } from '../../utils/metrics'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { Modal } from '../ui/Modal'
import { ResourceForm } from '../resources/ResourceForm'
import { NoteForm } from './NoteForm'

interface NotesViewProps {
  projectId: string
}

export function NotesView({ projectId }: NotesViewProps) {
  const data = useAppStore((state) => state.data)
  const createNote = useAppStore((state) => state.createNote)
  const updateNote = useAppStore((state) => state.updateNote)
  const deleteNote = useAppStore((state) => state.deleteNote)
  const createResource = useAppStore((state) => state.createResource)
  const [editingNote, setEditingNote] = useState<Note | undefined>()
  const [deletingNote, setDeletingNote] = useState<Note | undefined>()
  const [resourceTarget, setResourceTarget] = useState<Note | undefined>()
  const [isNoteModalOpen, setNoteModalOpen] = useState(false)

  const notes = data.notes.filter((note) => note.projectId === projectId)
  const resources = data.resources.filter((resource) => resource.projectId === projectId)

  const submitNote = (values: NoteFormValues) => {
    if (editingNote) {
      updateNote(editingNote.id, values)
    } else {
      createNote(projectId, values)
    }
    setEditingNote(undefined)
    setNoteModalOpen(false)
  }

  const submitResource = async (values: ResourceFormValues) => {
    await createResource(projectId, values)
    setResourceTarget(undefined)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--pd-foreground-strong)]">Notes</h3>
          <p className="text-sm text-[color:var(--pd-muted-foreground)]">
            Keep context, decisions, reminders, and references with the project.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditingNote(undefined)
            setNoteModalOpen(true)
          }}
        >
          Add note
        </Button>
      </div>

      {notes.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {notes.map((note) => {
            const linkedResources = resourceCountForEntity(resources, 'note', note.id)
            return (
              <article key={note.id} className={`pd-card pd-color-card p-4 pl-5 ${colorClass(note.color)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="pd-color-dot" aria-hidden="true" />
                      <h4 className="font-semibold text-[color:var(--pd-foreground-strong)]">{note.title}</h4>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[color:var(--pd-muted-foreground)]">
                      {note.content || 'No note content yet.'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--pd-border)] pt-3">
                  <span className="text-xs text-[color:var(--pd-muted-foreground)]">
                    Updated {formatDate(note.updatedAt)} · {linkedResources} resources
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" icon={<Link2 className="h-4 w-4" />} onClick={() => setResourceTarget(note)}>
                      Link
                    </Button>
                    <Button
                      size="sm"
                      icon={<Edit3 className="h-4 w-4" />}
                      onClick={() => {
                        setEditingNote(note)
                        setNoteModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setDeletingNote(note)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="No notes"
          message="Add project notes for context, links, decisions, meeting notes, or reminders."
          action={<Button variant="primary" onClick={() => setNoteModalOpen(true)}>Add note</Button>}
        />
      )}

      <Modal
        title={editingNote ? 'Edit note' : 'Create note'}
        isOpen={isNoteModalOpen}
        onClose={() => {
          setEditingNote(undefined)
          setNoteModalOpen(false)
        }}
      >
        <NoteForm
          note={editingNote}
          onCancel={() => {
            setEditingNote(undefined)
            setNoteModalOpen(false)
          }}
          onSubmit={submitNote}
        />
      </Modal>
      <Modal title="Link note resource" isOpen={Boolean(resourceTarget)} onClose={() => setResourceTarget(undefined)}>
        {resourceTarget ? (
          <ResourceForm
            data={data}
            projectId={projectId}
            defaultEntityType="note"
            defaultEntityId={resourceTarget.id}
            onCancel={() => setResourceTarget(undefined)}
            onSubmit={submitResource}
          />
        ) : null}
      </Modal>
      <ConfirmDialog
        title="Delete note"
        message="This removes the note and its PlanDesk resource links. Linked files and folders remain untouched."
        confirmLabel="Delete note"
        isOpen={Boolean(deletingNote)}
        onCancel={() => setDeletingNote(undefined)}
        onConfirm={() => {
          if (deletingNote) {
            deleteNote(deletingNote.id)
            setDeletingNote(undefined)
          }
        }}
      />
    </section>
  )
}
