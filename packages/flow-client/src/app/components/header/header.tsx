import styled from 'styled-components';

import { useAppSelector } from '../../redux/hooks';
import { selectTheme } from '../../redux/modules/builder/builder.slice';
import { Theme } from '../../themes';
import { ThemeSwitcher } from './theme-switcher';
import { TogglePanels } from './toggle-panels';

// StyledHeader defines the styles for the header component
const StyledHeader = styled.header<{ customTheme: Theme }>`
    background-color: ${props =>
        ({
            light: '#717c98',
            dark: '#112',
        }[props.customTheme])};
    color: #eee;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h1 {
        font-size: 1.5em;
    }

    .controls {
        align-items: center;
        display: flex;
        position: absolute;
        right: 20px;
    }
`;

// HeaderProps might include any props for theme switching or other functionalities
export type HeaderProps = Record<string, never>;

// Header component with theme toggle functionality
export const Header = () => {
    const theme = useAppSelector(selectTheme);

    return (
        <StyledHeader customTheme={theme}>
            <h1>Flow Canvas</h1>
            <div className="controls">
                <TogglePanels />
                <ThemeSwitcher />
            </div>
        </StyledHeader>
    );
};

export default Header;
