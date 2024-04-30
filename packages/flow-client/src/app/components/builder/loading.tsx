import styled from 'styled-components';

const StyledLoading = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 20px;
    color: #717c98;
`;

export const Loading = () => {
    return (
        <StyledLoading>
            <p>Loading, please wait...</p>
        </StyledLoading>
    );
};

export default Loading;
