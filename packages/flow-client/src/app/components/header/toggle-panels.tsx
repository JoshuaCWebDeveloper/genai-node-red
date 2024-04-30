import styled from 'styled-components';

import { useAppDispatch } from '../../redux/hooks';
import { builderActions } from '../../redux/modules/builder/builder.slice';

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
    }
`;

// HeaderProps might include any props for theme switching or other functionalities
export type TogglePanelsProps = {};

// Header component with theme toggle functionality
export const TogglePanels = ({}: TogglePanelsProps) => {
    const dispatch = useAppDispatch();

    return (
        <StyledTogglePanels className="toggle-panels">
            <button
                onClick={() => dispatch(builderActions.togglePrimarySidebar())}
                title="Toggle Primary Sidebar"
            >
                <i className="panel-icon left"></i>
            </button>
            <button
                onClick={() => dispatch(builderActions.toggleConsolePanel())}
                title="Toggle Console Panel"
            >
                <i className="panel-icon bottom"></i>
            </button>
            <button
                onClick={() =>
                    dispatch(builderActions.toggleSecondarySidebar())
                }
                title="Toggle Secondary Sidebar"
            >
                <i className="panel-icon right"></i>
            </button>
        </StyledTogglePanels>
    );
};

export default TogglePanels;
