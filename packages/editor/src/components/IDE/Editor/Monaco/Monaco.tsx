import React from 'react'
import monaco from 'monaco-editor'

export interface IProps {
  path: string
  value: string
  language: string
  options: Partial<monaco.editor.IEditorConstructionOptions>

  onValueChange: (value: string) => void
}

export class Monaco extends React.Component<IProps> {
  editor
  node
  changeSubscription

  initializeMonaco() {
    const { path, value, language, ...options } = this.props
    const model = monaco.editor.createModel(
      value,
      language,
      new monaco.Uri().with({
        scheme: 'file',
        path,
      }),
    )
    this.editor = monaco.editor.create(this.node, options)
    this.editor.setModel(model)

    this.changeSubscription = model.onDidChangeContent(() => {
      this.props.onValueChange(model.getValue())
    })
  }

  componentDidMount() {
    const win = window as any
    if (win.monaco !== undefined) {
      this.initializeMonaco()
    } else {
      win.require.config({
        baseUrl: '/',
      })

      win.require(['vs/editor/editor.main'], () => this.initializeMonaco())
    }
  }

  componentDidUpdate(prevProps: IProps) {
    const { path, value, language, onValueChange, ...options } = this.props

    this.editor.updateOptions(options)

    const model = this.editor.getModel()

    if (value !== model.getValue()) {
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ],
      )
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.dispose()
    }

    if (this.changeSubscription) {
      this.changeSubscription.dispose()
    }
  }

  render() {
    return <div ref={c => (this.node = c)} />
  }
}

export default Monaco
