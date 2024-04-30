import styled from 'styled-components';

import { Builder } from './components/builder/builder';
import { Header } from './components/header/header'; // Import the new Header component
import { useAppSelector } from './redux/hooks';
import { selectTheme } from './redux/modules/builder/builder.slice';
import themes from './themes';

// StyledApp defines the main application container styles.
// It ensures the flow canvas takes up the full viewport height for better visibility.
const StyledApp = styled.div`
    height: 100vh; // Full viewport height

    header {
        height: 40px;
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

            <Header />

            <Builder />
        </StyledApp>
    );
}

export default App;
