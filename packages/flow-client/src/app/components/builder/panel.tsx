import styled from 'styled-components';

import { UnknownAction } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { RootState } from '../../redux/store';
import ClosePanelButton from './close-panel-button';

const StyledPanel = styled.div`
    background-color: var(--color-background-main);
    border: 1px none var(--color-border-light);
    color: var(--color-text-sharp);
    overflow: auto;
    position: relative;

    .close-button {
        position: absolute;
        top: 5px;
        right: 5px;
    }
`;

export type PanelProps = {
    isVisibleSelector: (state: RootState) => boolean;
    closeAction: () => UnknownAction;
    children?: React.ReactNode;
    className?: string;
};

export const Panel = ({
    isVisibleSelector,
    closeAction,
    children,
    className = '',
}: PanelProps) => {
    const dispatch = useAppDispatch();
    const isVisible = useAppSelector(isVisibleSelector);

    if (!isVisible) return null;

    return (
        <StyledPanel className={`panel ${className}`}>
            <ClosePanelButton onClick={() => dispatch(closeAction())} />

            {children}
        </StyledPanel>
    );
};

export default Panel;
