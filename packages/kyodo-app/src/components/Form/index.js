import styled from 'styled-components';
import Input from '../Input';

export const FormInput = styled(Input)`
  margin-bottom: 30px;
`;

export const FormTextArea = styled(FormInput).attrs({
  asComponent: 'textarea',
})``;
