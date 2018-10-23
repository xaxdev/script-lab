import React from 'react'
import debounce from 'lodash/debounce'

export interface IProps {
  path: string
  language: string
  value: string
  options: Partial<monaco.editor.IEditorConstructionOptions>

  editorDidMount: (editor, monaco) => void
  onValueChange: (value: string) => void
}

export class Monaco extends React.Component<IProps> {
  editor
  container
  changeSubscription

  constructor(props) {
    super(props)
    this.container = React.createRef()
  }

  initializeMonaco() {
    const { path, value, language, options } = this.props
    const model = monaco.editor.createModel(
      value,
      language,
      new monaco.Uri().with({
        scheme: 'file',
        path,
      }),
    )
    this.editor = monaco.editor.create(this.container.current, options)
    this.editor.setModel(model)

    this.changeSubscription = model.onDidChangeContent(
      debounce(() => {
        this.props.onValueChange(model.getValue())
      }, 250),
    )

    this.props.editorDidMount(this.editor, monaco)
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
    if (this.editor) {
      const { path, value, language, options } = this.props

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
    return (
      <div ref={this.container} style={{ width: '100%', height: '100%' }} role="main" />
    )
  }
}

export default Monaco
