import React from "react";
import styled from "styled-components";
import Loading from "../../shared/components/Loading";
import Underline from "../../shared/components/Underline";
import { device } from "../../utils/device.sizes";
import { useReport } from "./hooks/useReport";

const PickupHistogramPage: React.FC = () => {
  const { data, isError, isLoading } = useReport();

  return (
    <Wrapper>
      <h1 className="title">סכ"ה הזמנות לפי נקודת חלוקה</h1>
      <div className="content">
        <>
          {isLoading && <Loading />}
          {isError && <h5>לא ניתן לטעון את הדוח</h5>}
          {data && data.pickupHistogram && (
            <table>
              <thead>
                <tr>
                  <th>
                    <div className="header">
                      <h5>נקודת חלוקה</h5>
                      <Underline className="underline" />
                    </div>
                  </th>
                  <th>
                    <div className="header">
                      <h5>סכום כולל</h5>
                      <Underline className="underline" />
                    </div>
                  </th>
                  <th>
                    <div className="header">
                      <h5>עמלה</h5>
                      <Underline className="underline" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {data?.pickupHistogram.length > 0 &&
                  data.pickupHistogram
                    .sort((a, b) =>
                      a.pickupDisplayName.localeCompare(b.pickupDisplayName)
                    )
                    .map((entry) => {
                      return (
                        <tr key={entry.pickupDisplayName}>
                          <td>
                            <h5 className="row-value">
                              {entry.pickupDisplayName}
                            </h5>
                          </td>
                          <td>
                            <h5 className="row-value">{entry.totalCost}</h5>
                          </td>
                          <td>
                            <h5 className="row-value">{entry.commision}</h5>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          )}
        </>
      </div>
    </Wrapper>
  );
};

export default PickupHistogramPage;

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 10vh;
    text-align: center;
  }

  .content {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  h5 {
    margin-top: 1rem;

    @media ${device.mobile} {
      font-size: 0.5rem;
    }
  }

  table {
    width: 100%;
    margin-bottom: 3rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h5 {
      margin-bottom: 0.5rem;
      text-align: center;
      @media ${device.mobile} {
        font-size: 0.75rem;
      }
    }
  }

  .row-value {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
  }

  .underline {
    width: 6rem;

    @media ${device.mobile} {
      width: 2rem;
    }
  }
`;
