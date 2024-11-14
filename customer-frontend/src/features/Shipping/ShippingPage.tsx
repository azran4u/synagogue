import React from "react";
import styled from "styled-components";

const ShippingPage: React.FC = () => {
  return (
    <main>
      <Wrapper className="page">
        <div className="title">
          <h1>משלוח</h1>
          <div className="underline"></div>
        </div>
        <div className="content">
          <p>משלוח חינם לנקודות חלוקה בכל רחבי הארץ</p>
          <p>לרשימת נקודות החלוקה</p>
          <p>תצוגת מפה</p>
          <p>מעוניינת לפתוח נקודת חלוקה באזורך? - צרי איתנו קשר</p>
        </div>
      </Wrapper>
    </main>
  );
};

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 15vh;
    text-align: center;
  }

  .content {
    min-height: 65vh;
  }
`;
export default ShippingPage;
