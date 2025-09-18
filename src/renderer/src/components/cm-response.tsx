import { useRef, useEffect } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from 'codemirror'
import { lineNumbers } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { xml } from '@codemirror/lang-xml'
import type { LanguageSupport } from '@codemirror/language'

const customDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'hsl(var(--sidebar))',
      color: 'white',
      height: '100%'
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: "'Fira Code', monospace",
      height: '100%'
    },
    '.cm-content': {
      caretColor: 'white',
      fontFamily: "'Fira Code', monospace !important",
      fontSize: '12px',
      padding: '8px',
      minHeight: '100%'
    },
    '.cm-cursor': {
      borderLeftColor: 'white'
    },
    '.cm-selectionBackground': {
      backgroundColor: 'hsl(var(--sidebar-accent))'
    },
    '.cm-focused': {
      outline: 'none'
    },
    '.cm-gutters': {
      backgroundColor: 'hsl(var(--sidebar))',
      color: 'hsl(var(--sidebar-foreground))',
      borderRight: '1px solid hsl(var(--border))',
      width: '2rem'
    },
    '.cm-lineNumbers': {
      color: 'hsl(var(--muted-foreground))'
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent !important'
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent !important',
      fontWeight: 'bold'
    },
    '.cm-keyword': {
      color: 'hsl(var(--primary))'
    },
    '.cm-string': {
      color: 'hsl(var(--accent))'
    },
    '.cm-comment': {
      color: 'hsl(var(--muted-foreground))',
      fontStyle: 'italic'
    },
    '.cm-number': {
      color: 'hsl(var(--primary))'
    },
    '.cm-variableName': {
      color: 'hsl(var(--primary))'
    },
    '.cm-propertyName': {
      color: 'hsl(var(--primary))'
    },
    '.cm-typeName': {
      color: 'hsl(var(--primary))'
    },
    '.cm-tagName': {
      color: 'hsl(var(--primary))'
    },
    '.cm-attributeName': {
      color: 'hsl(var(--accent))'
    }
  },
  { dark: true }
)

const CodeMirrorResponse = ({
  language = 'json',
  value = ''
}: {
  language: string
  value: string
}) => {
  const editorRef = useRef(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    let languageExtension: LanguageSupport

    switch (language) {
      case 'json':
        languageExtension = json()
        break
      case 'yaml':
        languageExtension = yaml()
        break
      case 'xml':
        languageExtension = xml()
        break
      case 'javascript':
      default:
        languageExtension = javascript()
        break
    }

    const extensions = [
      basicSetup,
      languageExtension,
      customDarkTheme,
      EditorView.lineWrapping,
      lineNumbers(),
      EditorState.readOnly.of(true) // Make it read-only but allow selection
    ]

    const state = EditorState.create({
      doc: value,
      extensions
    })

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current
    })

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [language])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentValue = view.state.doc.toString()
    if (value !== currentValue) {
      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: value }
      })
    }
  }, [value])

  return <div ref={editorRef} className="h-full w-full border border-border rounded-md" />
}

export default CodeMirrorResponse
