import { useRef, useEffect } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from 'codemirror'
import { keymap, lineNumbers } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { xml } from '@codemirror/lang-xml'
import { linter, Diagnostic } from '@codemirror/lint'
import { indentWithTab } from '@codemirror/commands'
import { vscodeKeymap } from "@replit/codemirror-vscode-keymap";
import type { LanguageSupport } from '@codemirror/language'
import * as yamlLib from 'js-yaml'
import * as acorn from 'acorn'

const customDarkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'hsl(var(--sidebar))',
      color: 'white',
      height: '100%'
    },
    '.cm-content': {
      caretColor: 'white',
      fontFamily: "'Fira Code', monospace !important",
      fontSize: '12px'
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

const yamlLinter = (view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  try {
    yamlLib.load(view.state.doc.toString())
  } catch (e: any) {
    diagnostics.push({
      from: 0,
      to: view.state.doc.length,
      severity: 'error',
      message: e.message
    })
  }
  return diagnostics
}

const xmlLinter = (view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(view.state.doc.toString(), 'text/xml')
  const errors = doc.querySelectorAll('parsererror')
  errors.forEach((error) => {
    diagnostics.push({
      from: 0,
      to: view.state.doc.length,
      severity: 'error',
      message: error.textContent || 'XML parsing error'
    })
  })
  return diagnostics
}

const javascriptLinterCustom = (view: EditorView): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  try {
    acorn.parse(view.state.doc.toString(), { ecmaVersion: 2020, sourceType: 'module' })
  } catch (e: any) {
    diagnostics.push({
      from: e.loc ? view.state.doc.line(e.loc.line - 1).from + e.loc.column : 0,
      to: e.loc
        ? view.state.doc.line(e.loc.line - 1).from + e.loc.column + 1
        : view.state.doc.length,
      severity: 'error',
      message: e.message
    })
  }
  return diagnostics
}

const CodeMirrorEditor = ({
  language = 'json',
  value = '',
  onChange,
  onErrors
}: {
  language: string
  value: string
  onChange?: (value: string) => void
  onErrors?: (diagnostics: Diagnostic[]) => void
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

    let extensions = [
      basicSetup,
      languageExtension,
      customDarkTheme,
      EditorView.lineWrapping,
      lineNumbers(),
      keymap.of(vscodeKeymap),
      keymap.of([indentWithTab]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString())
        }
        if (onErrors) {
          const diags: Diagnostic[] = [] // Placeholder, since field access is problematic
          onErrors(diags)
        }
      })
    ]

    // Add language-specific linters
    switch (language) {
      case 'json':
        extensions.push(linter(jsonParseLinter()))
        break
      case 'javascript':
        extensions.push(linter(javascriptLinterCustom))
        break
      case 'yaml':
        extensions.push(linter(yamlLinter))
        break
      case 'xml':
        extensions.push(linter(xmlLinter))
        break
    }

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

  return (
    <div
      ref={editorRef}
      className="bg-sidebar flex border border-border rounded-md h-full overflow-hidden"
    />
  )
}

export default CodeMirrorEditor
