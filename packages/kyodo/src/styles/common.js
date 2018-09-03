import styled from 'styled-components';

const FramedDiv = styled.div`
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #000000;
  box-shadow: 3px 3px 0px #f5f905;
  box-sizing: border-box;
  display: inline-block;
  font-family: Roboto Mono;
  font-size: 14px;
  font-style: normal;
  font-weight: normal;
  line-height: 34px;
  margin-bottom: 3px;
  padding: 0 14px;
  right: 3px;
  top: 8px;
  text-decoration: none;
  color: black;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FramedLink = FramedDiv.withComponent('a');

export { FramedDiv, FramedLink };
