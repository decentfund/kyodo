import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 5px 15px 8px 12px;
  border-radius: 5px;
  font-size: 1.1rem;
  background: ${props => (props.active ? '#F5F905' : 'rgba(0, 0, 0, 0.06)')};
  border: none;
  box-shadow: inset -2px -2px 0px 5px rgba(255, 255, 255, 1);
  border-radius: 6px 8px 8px 8px;
  border: ${props => (props.active ? '1px solid black' : 'none')};
`;
// box-shadow: ${props => (props.profile ? '2px 2px #F5F905' : 'none')};

export default StyledButton;
