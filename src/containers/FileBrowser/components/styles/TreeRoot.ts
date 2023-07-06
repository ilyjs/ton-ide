import styled from '@emotion/styled';

type Props = {
  isSelected: boolean
}

export const TreeRoot = styled.div<Props>`
  align-items: center;
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  height: 32px;
  padding-inline-end: 8px;
  ${props => props.isSelected? 'color: #1967d2;' : ''};

`