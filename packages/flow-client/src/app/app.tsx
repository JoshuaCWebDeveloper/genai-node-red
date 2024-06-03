import styled from 'styled-components';

import { Builder } from './components/builder/builder';
import { Header } from './components/header/header'; // Import the new Header component
import { useAppSelector } from './redux/hooks';
import { selectTheme } from './redux/modules/builder/builder.slice';
import themes from './themes';
import { Logger } from './logger';

// StyledApp defines the main application container styles.
// It ensures the flow canvas takes up the full viewport height for better visibility.
const StyledApp = styled.div`
    background-color: var(--color-background-main);
    display: flex;
    flex-direction: column;
    height: 100%;

    header {
        height: 40px;
    }

    .builder {
        flex: 1;
    }
`;

// App is the main functional component of the application.
// It renders the FlowCanvasContainer component within a styled div.
export function App() {
    const theme = useAppSelector(selectTheme);
    const GlobalTheme = themes[theme];

    return (
        <StyledApp>
            <GlobalTheme />
            <Logger />

            <Header />

            <Builder />
        </StyledApp>
    );
}

export default App;
