import styled from 'styled-components';

import {
    builderActions,
    selectShowSecondarySidebar,
} from '../../redux/modules/builder/builder.slice';
import { NodePalette } from '../node-palette/node-palette';
import { PanelSection, PanelSectionContainer } from './panel-section';
import { SidebarTab, TabbedSidebar } from './tabbed-sidebar';
import { Workspace } from './workspace';

// StyledSecondarySidebar extends the Panel component with specific styles for the secondary sidebar
const StyledSecondarySidebar = styled(TabbedSidebar)`
    width: 250px; // Adjust width as needed
    display: flex;
    flex-direction: column;
    overflow: hidden; // Prevents overflow of child components

    .workspace-section {
        min-height: 130px;

        &:has(.flow) {
            min-height: 50px;
        }

        &.collapsed {
            min-height: 0;
        }
    }
`;

// SecondarySidebar component that includes NodePalette and potentially other tools
export const SecondarySidebar = () => {
    return (
        <StyledSecondarySidebar
            className="secondary"
            isVisibleSelector={selectShowSecondarySidebar}
            closeAction={builderActions.toggleSecondarySidebar}
        >
            <SidebarTab icon="screwdriver-wrench" name="Tools">
                <PanelSectionContainer>
                    <PanelSection
                        className="workspace-section"
                        title="Workspace"
                        collapsible
                    >
                        <Workspace />
                    </PanelSection>

                    <PanelSection title="Node Palette" collapsible>
                        <NodePalette />
                    </PanelSection>
                </PanelSectionContainer>
            </SidebarTab>

            <SidebarTab icon="question" name="Help">
                <PanelSectionContainer>
                    <PanelSection title="Help Browser">
                        <div>Help Browser</div>
                    </PanelSection>
                </PanelSectionContainer>
            </SidebarTab>
        </StyledSecondarySidebar>
    );
};

export default SecondarySidebar;
