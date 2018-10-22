import React from 'react'

export interface IProps {
  path: string
  value: string
  language: string
  options: Partial<monaco.editor.IEditorConstructionOptions>

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

  componentWillUnmount() {
    if (this.editor) {
      this.editor.dispose()
    }

    if (this.changeSubscription) {
      this.changeSubscription.dispose()
    }
  }

  render() {
    return <div ref={this.container} />
  }
}

export default Monaco
