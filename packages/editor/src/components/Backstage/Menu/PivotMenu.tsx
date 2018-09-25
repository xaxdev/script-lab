import React from 'react'
import styled, { withTheme } from 'styled-components'

import PivotBar from '../../PivotBar'

const Wrapper = styled.div`
  box-shadow: 0px 2px 4px 2px ${props => props.theme.neutralSecondary};
`

interface IMenuItem {
  key: string
  label?: string
  icon: string
  onClick: () => void
}

export interface IProps {
  items: IMenuItem[]
  selectedKey: string
  theme: ITheme // from withTheme
}

class PivotMenu extends React.Component<IProps> {
  onSelect = (key: string) => this.props.items.find(item => item.key === key)!.onClick()

  render(): JSX.Element {
    const { items, selectedKey, theme } = this.props

    return (
      <Wrapper>
        <PivotBar
          selectedKey={selectedKey}
          onSelect={this.onSelect}
          items={items.map(({ label, icon, key }) => {
            if (['back', 'new'].includes(key)) {
              return {
                iconName: icon,
                key,
              }
            } else {
              return {
                text: label,
                key,
              }
            }
          })}
          backgroundColor={theme.primary}
          selectedColor={theme.primaryDark}
        />
      </Wrapper>
    )
  }
}

export default withTheme(PivotMenu)