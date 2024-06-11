import styled from 'styled-components';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    builderActions,
    selectShowConsolePanel,
    selectShowPrimarySidebar,
    selectShowSecondarySidebar,
} from '../../redux/modules/builder/builder.slice';

// StyledHeader defines the styles for the header component
const StyledTogglePanels = styled.div`
    margin-right: 20px;

    button {
        background: none;
        border: none;
        cursor: pointer;
        line-height: 0;
        margin: 0 5px;
        padding: 0;
    }

    .panel-icon {
        width: 16px;
        height: 16px;
        position: relative;
        display: inline-block;

        &:before,
        &:after {
            border: 1px solid #fff;
            border-radius: 2px;
            content: '';
            position: absolute;
        }

        &:before {
            height: 100%;
            width: 100%;
            top: 0;
            left: 0;
        }

        &:after {
            background-color: #fff;
            height: calc(100% + 0px);
            width: calc(100% + 0px);
            top: 0;
            left: 0;
        }

        &.top:after {
            height: calc(50% - 2px);
        }

        &.right:after {
            width: calc(50% - 2px);
            right: -1px;
            left: initial;
        }

        &.bottom:after {
            height: calc(50% - 2px);
            top: initial;
            bottom: -1px;
        }

        &.left:after {
            width: calc(50% - 2px);
        }

        &.empty {
            opacity: 0.3;
        }
    }
`;

// HeaderProps might include any props for theme switching or other functionalities
export type TogglePanelsProps = Record<string, never>;

// Header component with theme toggle functionality
export const TogglePanels = () => {
    const dispatch = useAppDispatch();
    const isPrimarySidebarOpen = useAppSelector(selectShowPrimarySidebar);
    const isConsolePanelOpen = useAppSelector(selectShowConsolePanel);
    const isSecondarySidebarOpen = useAppSelector(selectShowSecondarySidebar);

    return (
        <StyledTogglePanels className="toggle-panels">
            <button
                onClick={() => dispatch(builderActions.togglePrimarySidebar())}
                title="Toggle Primary Sidebar"
                className={!isPrimarySidebarOpen ? 'empty' : ''}
            >
                <i
                    className={`panel-icon left ${
                        !isPrimarySidebarOpen ? 'empty' : ''
                    }`}
                ></i>
            </button>
            <button
                onClick={() => dispatch(builderActions.toggleConsolePanel())}
                title="Toggle Console Panel"
                className={!isConsolePanelOpen ? 'empty' : ''}
            >
                <i
                    className={`panel-icon bottom ${
                        !isConsolePanelOpen ? 'empty' : ''
                    }`}
                ></i>
            </button>
            <button
                onClick={() =>
                    dispatch(builderActions.toggleSecondarySidebar())
                }
                title="Toggle Secondary Sidebar"
                className={!isSecondarySidebarOpen ? 'empty' : ''}
            >
                <i
                    className={`panel-icon right ${
                        !isSecondarySidebarOpen ? 'empty' : ''
                    }`}
                ></i>
            </button>
        </StyledTogglePanels>
    );
};

export default TogglePanels;
