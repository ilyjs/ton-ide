import styled from '@emotion/styled';

type Props = {
  isOpen: boolean
}

export const ExpandIconWrapper = styled.div<Props>`
  align-items: center;
  font-size: 0;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
  transition: transform linear .1s;
  transform: ${props => props.isOpen? 'rotate(90deg)' : 'rotate(0deg)'};

`