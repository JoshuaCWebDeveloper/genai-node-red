import styled from 'styled-components';

import {
    builderActions,
    selectShowSecondarySidebar,
} from '../../redux/modules/builder/builder.slice';
import { NodePalette } from '../node-palette/node-palette';
import { Panel } from './panel';

// StyledSecondarySidebar extends the Panel component with specific styles for the secondary sidebar
const StyledSecondarySidebar = styled(Panel)`
    width: 250px; // Adjust width as needed
    display: flex;
    flex-direction: column;
    overflow: hidden; // Prevents overflow of child components
`;

// SecondarySidebar component that includes NodePalette and potentially other tools
export const SecondarySidebar = () => {
    return (
        <StyledSecondarySidebar
            className="secondary-sidebar"
            isVisibleSelector={selectShowSecondarySidebar}
            closeAction={builderActions.toggleSecondarySidebar}
        >
            <NodePalette />
            {/* Additional components like HelpBrowser can be added here */}
        </StyledSecondarySidebar>
    );
};

export default SecondarySidebar;
