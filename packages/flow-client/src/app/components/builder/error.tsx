import styled from 'styled-components';

const StyledError = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: #d32f2f;
    font-size: 18px;
    text-align: center;
`;

export type ErrorProps = {
    message: string;
};

export const Error = ({ message }: ErrorProps) => {
    return (
        <StyledError>
            <div>
                <p>
                    <strong>Error:</strong> {message}
                </p>
                <p>
                    Please try reloading the page or contact support if the
                    problem persists.
                </p>
            </div>
        </StyledError>
    );
};

export default Error;
