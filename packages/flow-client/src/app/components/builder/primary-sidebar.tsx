import styled from 'styled-components';

import {
    builderActions,
    selectShowPrimarySidebar,
} from '../../redux/modules/builder/builder.slice';
import FlowTree from '../flow-tree/flow-tree';
import { PanelSection, PanelSectionContainer } from './panel-section';
import { SidebarTab, TabbedSidebar } from './tabbed-sidebar';

const StyledPrimarySidebar = styled(TabbedSidebar)`
    width: 250px;
`;

export const PrimarySidebar = () => {
    return (
        <StyledPrimarySidebar
            className="primary-sidebar"
            isVisibleSelector={selectShowPrimarySidebar}
            closeAction={builderActions.togglePrimarySidebar}
        >
            <SidebarTab icon="folder-closed" name="Flow Tree">
                <PanelSectionContainer>
                    <PanelSection title="Flow Tree" collapsible>
                        <FlowTree />
                    </PanelSection>

                    <PanelSection title="Info" collapsible initialCollapsed>
                        <div>Info</div>
                    </PanelSection>
                </PanelSectionContainer>
            </SidebarTab>

            <SidebarTab icon="database" name="Data">
                <PanelSectionContainer>
                    <PanelSection title="Context" collapsible>
                        <div>Context</div>
                    </PanelSection>

                    <PanelSection
                        title="Config Nodes"
                        collapsible
                        initialCollapsed
                    >
                        <div>Config Nodes</div>
                    </PanelSection>
                </PanelSectionContainer>
            </SidebarTab>
        </StyledPrimarySidebar>
    );
};

export default PrimarySidebar;
