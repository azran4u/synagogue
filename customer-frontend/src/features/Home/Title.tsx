import styled from "styled-components";

const Title: React.FC = () => {
  return (
    <Wrapper>
      <h1>טייץ השומרון</h1>
      <p>טייצים, גרביון ותחרה איכותיים במגוון מידות וצבעים</p>
    </Wrapper>
  );
};

export default Title;

const Wrapper = styled.div`
  min-height: 15vh;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;

  h1,
  p {
    margin: 0 auto;
  }
`;
