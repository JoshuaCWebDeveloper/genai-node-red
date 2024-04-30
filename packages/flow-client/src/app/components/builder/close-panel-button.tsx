import styled from 'styled-components';

const CloseButton = styled.button`
    background-color: transparent;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;

    &:hover {
        background-color: var(--color-background-element-medium);
        box-shadow: 0 0px 2px var(--color-border-sharp);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--color-border-light);
    }

    span {
        color: var(--color-text-sharp);
        font-size: 16px;
        line-height: 1;
    }
`;

export const ClosePanelButton = (
    props: React.ComponentPropsWithoutRef<typeof CloseButton>
) => (
    <CloseButton className="close-button" aria-label="Close panel" {...props}>
        <span>&times;</span>
    </CloseButton>
);

export default ClosePanelButton;
